import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {useUser} from "shared/hooks/useUser";
import Api from "api";

const SignupPage = () => {
  const [error, setError] = useState<string | null>(null);
  const {updateUser} = useUser();
  const navigate = useNavigate();

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");

    Api.post("/signup", {name, email, password})
      .then(response => {
        localStorage.setItem("accessToken", response.data.accessToken);
        localStorage.setItem("refreshToken", response.data.refreshToken);
        updateUser();
        navigate("/");
      })
      .catch(error => {
        if (error.status === 409) {
          setError("Пользователь с указанным адресом электронной почты уже существует");
          return;
        }
        if (error.status === 400) {
          if (error.response.error === "invalid email format") {
            setError("Неверный формат электронной почты");
            return;
          }
          setError("Имя пользователя должно быть от 3 до 16 символов");
          return;
        }
        setError("Не удалось зарегистрироваться");
      });
  };

  return <>
    <h1 className="text-3xl text-center mt-10">Регистрация</h1>

    <form onSubmit={onSubmit} className="mx-auto w-1/4 mt-16 flex flex-col items-center">
      {error && <h2 className="self-start mb-8 text-xl text-red-600">{error}</h2>}

      <input
        type="text"
        autoComplete="username"
        required={true}
        name="name"
        placeholder="Имя пользователя"
        className="w-full outline-none bg-inherit border-b-2 py-2 dark:placeholder:text-dark-text-primary"
      />

      <input
        type="email"
        autoComplete="email"
        required={true}
        name="email"
        placeholder="Email"
        className="my-10 w-full outline-none bg-inherit border-b-2 py-2 dark:placeholder:text-dark-text-primary"
      />

      <input
        type="password"
        autoComplete="current-password"
        required={true}
        name="password"
        placeholder="Пароль"
        className="w-full outline-none bg-inherit border-b-2 py-2 dark:placeholder:text-dark-text-primary"
      />

      <button
        type="submit"
        className="mt-14 text-xl px-7 py-2 rounded dark:bg-dark-secondary"
      >
        Зарегистрироваться →
      </button>
    </form>
  </>;
};

export default SignupPage;
