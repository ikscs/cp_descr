// userfront-customizations.js

document.addEventListener("DOMContentLoaded", () => {
  // функция для применения кастомизаций
  function applyCustomizations() {
    let changedSomething = false;

    const submitButton = document.querySelector(
      ".userfront-button.userfront-button-primary[type='submit']"
    );
    if (submitButton && submitButton.textContent !== "Войти") {
      submitButton.textContent = "Войти";
      console.log("✅ Кнопка изменена");
      changedSomething = true;
    }

    const emailLinkText = document.querySelector(".userfront-icon-button-text");
    if (emailLinkText && emailLinkText.textContent !== "Отправить ссылку на почту") {
      emailLinkText.textContent = "Отправить ссылку на почту";
      console.log("✅ Email link изменён");
      changedSomething = true;
    }

    const orTextElement = document.querySelector(".userfront-divider-text");
    if (orTextElement && orTextElement.textContent !== "ИЛИ") {
      orTextElement.textContent = "ИЛИ";
      console.log("✅ Разделитель изменён");
      changedSomething = true;
    }

    const emailLabel = document.querySelector("label[for='emailOrUsername']");
    if (emailLabel && emailLabel.textContent !== "Email или имя пользователя") {
      emailLabel.textContent = "Email или имя пользователя";
      console.log("✅ Label email изменён");
      changedSomething = true;
    }

    const passwordLabel = document.querySelector("label[for='password']");
    if (passwordLabel && passwordLabel.textContent !== "Пароль") {
      passwordLabel.textContent = "Пароль";
      console.log("✅ Label password изменён");
      changedSomething = true;
    }

    const loginHeading = document.querySelector("h2");
    if (loginHeading && loginHeading.textContent.trim() === "Log in") {
      loginHeading.textContent = "Вход в аккаунт";
      console.log("✅ Заголовок изменён");
      changedSomething = true;
    }

    return changedSomething;
  }

  // сразу пробуем на случай, если DOM уже готов
  applyCustomizations();

  // наблюдатель за изменениями DOM
  const observer = new MutationObserver(() => {
    const updated = applyCustomizations();
    if (updated) {
      console.log("⚡ Кастомизации применены через MutationObserver");
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
});
