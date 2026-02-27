export default function RegisterPage() {
  return (
    <div>
      <h1>Регистрация</h1>
      <form>
        <div>
          <input type="email" placeholder="Email" />
        </div>
        <div>
          <input type="password" placeholder="Пароль" />
        </div>
        <div>
          <input type="text" placeholder="Имя" />
        </div>
        <div>
          <input type="text" placeholder="Фамилия" />
        </div>
        <div>
          <input type="tel" placeholder="Телефон" />
        </div>
        <button type="submit">Зарегистрироваться</button>
      </form>
    </div>
  )
}