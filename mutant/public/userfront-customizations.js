// userfront-customizations.js

document.addEventListener('DOMContentLoaded', () => {
    // Ждем 500 миллисекунд (0.5 секунды), чтобы дать Userfront время загрузить форму
    setTimeout(() => {
        // Изменение текста кнопки "Submit" на "Войти"
        const submitButton = document.querySelector('.userfront-button.userfront-button-primary[type="submit"]');
        if (submitButton) {
            submitButton.textContent = "Войти";
            console.log("Текст кнопки успешно изменен на 'Войти'.");
        } else {
            console.warn("Кнопка отправки Userfront все еще не найдена после задержки. Возможно, проблема в селекторе или еще более длительной задержке.");
        }

        // Изменение текста "Email me a link"
        const emailLinkText = document.querySelector('.userfront-icon-button-text');
        if (emailLinkText) {
            emailLinkText.textContent = "Отправить ссылку на почту";
            console.log("Текст 'Email me a link' изменен на 'Отправить ссылку на почту'.");
        } else {
            console.warn("Элемент с классом 'userfront-icon-button-text' не найден. Проверьте селектор или убедитесь, что форма уже загружена.");
        }

        // Изменение текста разделителя "OR" на "ИЛИ"
        const orTextElement = document.querySelector('.userfront-divider-text');
        if (orTextElement) {
            orTextElement.textContent = "ИЛИ";
            console.log("Текст разделителя изменен на 'ИЛИ'.");
        } else {
            console.warn("Элемент с классом 'userfront-divider-text' не найден. Возможно, проблема в селекторе или форма еще не загружена.");
        }

        // Изменение текста "Email address or username"
        const emailLabel = document.querySelector('label[for="emailOrUsername"]');
        if (emailLabel) {
            emailLabel.textContent = "Email или имя пользователя";
            console.log("Текст поля 'Email address or username' изменен.");
        } else {
            console.warn("Элемент <label> для 'emailOrUsername' не найден. Возможно, проблема в селекторе или форма еще не загружена.");
        }

        // Изменение текста "Password"
        const passwordLabel = document.querySelector('label[for="password"]');
        if (passwordLabel) {
            passwordLabel.textContent = "Пароль";
            console.log("Текст поля 'Password' изменен на 'Пароль'.");
        } else {
            console.warn("Элемент <label> для 'password' не найден. Возможно, проблема в селекторе или форма еще не загружена.");
        }

        // Изменение заголовка "Log in"
        // Важно: если на странице несколько <h2>, убедитесь, что ваш селектор точен.
        // Например, если заголовок внутри контейнера Userfront формы:
        // const loginHeading = document.querySelector('.Userfront-form h2');
        const loginHeading = document.querySelector('h2'); // Используйте более специфичный селектор, если это необходимо
        if (loginHeading && loginHeading.textContent.trim() === 'Log in') {
            loginHeading.textContent = "Вход в аккаунт";
            console.log("Заголовок 'Log in' изменен на 'Вход в аккаунт'.");
        } else {
            console.warn("Заголовок <h2> 'Log in' не найден или не соответствует ожидаемому тексту. Возможно, проблема в селекторе или форма еще не загружена.");
        }

    }, 500); // Регулируйте эту задержку, если нужно
});