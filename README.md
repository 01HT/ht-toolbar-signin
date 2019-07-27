# ht-toolbar-signin

Create steps

1. Get js build from url https://www.gstatic.com/firebasejs/ui/3.4.1/firebase-ui-auth__ru.js
2. Change button text in file firebase-ui-auth\_\_ru.js

Через сервис https://www.branah.com/unicode-converter заменить

Войти через аккаунт = \u0412\u043e\u0439\u0442\u0438 \u0447\u0435\u0440\u0435\u0437 \u0430\u043a\u043a\u0430\u0443\u043d\u0442

заменить на Войти через = \u0412\u043e\u0439\u0442\u0438 \u0447\u0435\u0440\u0435\u0437

Войти по адресу электронной почты = \u0412\u043e\u0439\u0442\u0438 \u043f\u043e \u0430\u0434\u0440\u0435\u0441\u0443 \u044d\u043b\u0435\u043a\u0442\u0440\u043e\u043d\u043d\u043e\u0439 \u043f\u043e\u0447\u0442\u044b

заменить на Войти через почту = \u0412\u043e\u0439\u0442\u0438 \u0447\u0435\u0440\u0435\u0437 \u043f\u043e\u0447\u0442\u0443

3. Replace .call(this) on .call(window)

4. Get css styles from url https://www.gstatic.com/firebasejs/ui/3.4.1/firebase-ui-auth.css

5. In ht-toolbar-signin-email-verify-block.js add all element app names `myaccount-app, elements-app, armarker-app`
