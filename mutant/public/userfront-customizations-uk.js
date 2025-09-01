// userfront-customizations.js

document.addEventListener("DOMContentLoaded", () => {
  // функція для застосування кастомізацій
  function applyCustomizations() {
    let changedSomething = false;

    const submitButton = document.querySelector(
      ".userfront-button.userfront-button-primary[type='submit']"
    );
    if (submitButton && submitButton.textContent !== "Увійти") {
      submitButton.textContent = "Увійти";
      console.log("✅ Кнопку змінено");
      changedSomething = true;
    }

    const emailLinkText = document.querySelector(".userfront-icon-button-text");
    if (emailLinkText && emailLinkText.textContent !== "Надіслати посилання на пошту") {
      emailLinkText.textContent = "Надіслати посилання на пошту";
      console.log("✅ Email-посилання змінено");
      changedSomething = true;
    }

    const orTextElement = document.querySelector(".userfront-divider-text");
    if (orTextElement && orTextElement.textContent !== "АБО") {
      orTextElement.textContent = "АБО";
      console.log("✅ Роздільник змінено");
      changedSomething = true;
    }

    const emailLabel = document.querySelector("label[for='emailOrUsername']");
    if (emailLabel && emailLabel.textContent !== "Email або ім’я користувача") {
      emailLabel.textContent = "Email або ім’я користувача";
      console.log("✅ Label email змінено");
      changedSomething = true;
    }

    const passwordLabel = document.querySelector("label[for='password']");
    if (passwordLabel && passwordLabel.textContent !== "Пароль") {
      passwordLabel.textContent = "Пароль";
      console.log("✅ Label password змінено");
      changedSomething = true;
    }

    const loginHeading = document.querySelector("h2");
    if (loginHeading && loginHeading.textContent.trim() === "Log in") {
      loginHeading.textContent = "Вхід до акаунта";
      console.log("✅ Заголовок змінено");
      changedSomething = true;
    }

    return changedSomething;
  }

  // одразу пробуємо на випадок, якщо DOM вже готовий
  applyCustomizations();

  // спостерігач за змінами DOM
  const observer = new MutationObserver(() => {
    const updated = applyCustomizations();
    if (updated) {
      console.log("⚡ Кастомізації застосовані через MutationObserver");
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
});
