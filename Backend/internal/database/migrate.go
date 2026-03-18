package database

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/jmoiron/sqlx"
)

// RunMigrations читает все .sql файлы из папки migrationsDir,
// сортирует их по имени и применяет те, которых ещё нет в таблице migrations.
func RunMigrations(db *sqlx.DB, migrationsDir string) error {
	// 1. Создаём таблицу учёта миграций если её нет
	_, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS migrations (
			id         SERIAL PRIMARY KEY,
			filename   TEXT NOT NULL UNIQUE,
			applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)
	`)
	if err != nil {
		return fmt.Errorf("create migrations table: %w", err)
	}

	// 2. Читаем уже применённые миграции
	rows, err := db.Query(`SELECT filename FROM migrations`)
	if err != nil {
		return fmt.Errorf("query applied migrations: %w", err)
	}
	applied := make(map[string]bool)
	for rows.Next() {
		var name string
		if err := rows.Scan(&name); err != nil {
			rows.Close()
			return err
		}
		applied[name] = true
	}
	rows.Close()

	// 3. Читаем файлы из папки
	entries, err := os.ReadDir(migrationsDir)
	if err != nil {
		return fmt.Errorf("read migrations dir %q: %w", migrationsDir, err)
	}

	var files []string
	for _, e := range entries {
		if !e.IsDir() && strings.HasSuffix(e.Name(), ".sql") {
			files = append(files, e.Name())
		}
	}
	sort.Strings(files) // сортируем по имени: 001_, 002_, ...

	// 4. Применяем новые
	for _, filename := range files {
		if applied[filename] {
			log.Printf("  migration %s — already applied, skip", filename)
			continue
		}

		content, err := os.ReadFile(filepath.Join(migrationsDir, filename))
		if err != nil {
			return fmt.Errorf("read %s: %w", filename, err)
		}

		log.Printf("  applying migration %s ...", filename)

		tx, err := db.Begin()
		if err != nil {
			return fmt.Errorf("begin tx for %s: %w", filename, err)
		}

		if _, err := tx.Exec(string(content)); err != nil {
			tx.Rollback()
			return fmt.Errorf("exec %s: %w", filename, err)
		}

		if _, err := tx.Exec(`INSERT INTO migrations (filename) VALUES ($1)`, filename); err != nil {
			tx.Rollback()
			return fmt.Errorf("record migration %s: %w", filename, err)
		}

		if err := tx.Commit(); err != nil {
			return fmt.Errorf("commit %s: %w", filename, err)
		}

		log.Printf("  migration %s — OK", filename)
	}

	return nil
}