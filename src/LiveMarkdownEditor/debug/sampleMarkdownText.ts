export const sampleTypescriptCodeBlock = `***
\`\`\`ts
interface CreatePromise {
    <Value = void, RejectReason = void>(): [
        Promise<Value>,
        Value extends void ? () => void : (value: Value) => void,
        RejectReason extends void ? () => void : (reason: RejectReason) => void,
    ];
}

const createPromise = (() => {
    let promiseResolve: (value?: unknown) => void;
    let promiseReject: (reason?: unknown) => void;
    const a = true;
    const b = "false";
    const c = 123;

    const promise = new Promise<unknown>((resolve, reject) => {
        promiseResolve = resolve;
        promiseReject = reject;
    });

    return [promise, promiseResolve!, promiseReject!];
}) as CreatePromise;
\`\`\`
***`;

export const sampleMarkdownCodeBlocks = `***
\`\`\`xml
<?xml version="1.0" encoding="UTF-8"?>
<shiporder orderid="889923"
xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
xsi:noNamespaceSchemaLocation="shiporder.xsd">
   <orderperson>John Smith</orderperson>
   <shipto>
      <name>Ola Nordmann</name>
      <address>Langgt 23</address>
      <city>4000 Stavanger</city>
      <country>Norway</country>
   </shipto>
   <item>
      <title>Empire Burlesque</title>
      <note>Special Edition</note>
      <quantity>1</quantity>
      <price>10.90</price>
   </item>
   <item>
      <title>Hide your heart</title>
      <quantity>1</quantity>
      <price>9.90</price>
   </item>
</shiporder>
\`\`\`

\`\`\`html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mr. Camel</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Pacifico&display=swap');

    body {
      margin: 0;
      box-sizing: border-box;
    }

    .container {
      line-height: 150%;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      background-color: #e9e9e9;
    }

    .header h1 {
      color: #222222;
      font-size: 30px;
      font-family: 'Pacifico', cursive;
    }

    .header .social a {
      padding: 0 5px;
      color: #222222;
    }

    .left {
      float: left;
      width: 180px;
      margin: 0;
      padding: 1em;
    }

    .content {
      margin-left: 190px;
      border-left: 1px solid #d4d4d4;
      padding: 1em;
      overflow: hidden;
    }

    ul {
      list-style-type: none;
      margin: 0;
      padding: 0;
      font-family: sans-serif;
    }

    li a {
      display: block;
      color: #000;
      padding: 8px 16px;
      text-decoration: none;
    }

    li a.active {
      background-color: #84e4e2;
      color: white;
    }

    li a:hover:not(.active) {
      background-color: #29292a;
      color: white;
    }

    table {
      font-family: arial, sans-serif;
      border-collapse: collapse;
      width: 100%;
      margin: 30px 0;
    }

    td,
    th {
      border: 1px solid #dddddd;
      padding: 8px;
    }

    tr:nth-child(1) {
      background-color: #84e4e2;
      color: white;
    }

    tr td i.fas {
      display: block;
      font-size: 35px;
      text-align: center;
    }

    .footer {
      padding: 55px 20px;
      background-color: #2e3550;
      color: white;
      text-align: center;
    }
  </style>
</head>

<body>
  <div class="container">
    <header class="header">
      <h1>Mr. Camel</h1>
      <div class="social">
        <a href="#"><i class="fab fa-facebook"></i></a>
        <a href="#"><i class="fab fa-instagram"></i></a>
        <a href="#"><i class="fab fa-twitter"></i></a>
      </div>
    </header>
    <aside class="left">
      <img src="./assets/html/mr-camel.jpg" width="160px" />
      <ul>
        <li><a class="active" href="#home">Home</a></li>
        <li><a href="#career">Career</a></li>
        <li><a href="#contact">Contact</a></li>
        <li><a href="#about">About</a></li>
      </ul>
      <br><br>
      <p>"Do something important in life. I convert green grass to code."<br>- Mr Camel</p>
    </aside>
    <main class="content">
      <h2>About Me</h2>
      <p>I don't look like some handsome horse, but I am a real desert king. I can survive days without water.</p>
      <h2>My Career</h2>
      <p>I work as a web developer for a company that makes websites for camel businesses.</p>
      <hr><br>
      <h2>How Can I Help You?</h2>
      <table>
        <tr>
          <th>SKILL 1</th>
          <th>SKILL 2</th>
          <th>SKILL 3</th>
        </tr>
        <tr>
          <td><i class="fas fa-broom"></i></td>
          <td><i class="fas fa-archive"></i></td>
          <td><i class="fas fa-trailer"></i></td>
        </tr>
        <tr>
          <td>Cleaning kaktus in your backyard</td>
          <td>Storing some fat for you</td>
          <td>Taking you through the desert</td>
        </tr>
        <tr>
      </table>
      <form>
        <label>Email: <input type="text" name="email"></label><br>
        <label> Mobile: <input type="text" name="mobile"> </label><br>
        <textarea name="comments" rows="4">Enter your message</textarea><br>
        <input type="submit" value="Submit" /><br>
      </form>
    </main>
    <footer class="footer">&copy; Copyright Mr. Camel</footer>
  </div>
</body>

</html>
\`\`\`

***
\`\`\`ts
interface CreatePromise {
    <Value = void, RejectReason = void>(): [
        Promise<Value>,
        Value extends void ? () => void : (value: Value) => void,
        RejectReason extends void ? () => void : (reason: RejectReason) => void,
    ];
}

const createPromise = (() => {
    let promiseResolve: (value?: unknown) => void;
    let promiseReject: (reason?: unknown) => void;
    const a = true;
    const b = "false";
    const c = 123;

    const promise = new Promise<unknown>((resolve, reject) => {
        promiseResolve = resolve;
        promiseReject = reject;
    });

    return [promise, promiseResolve!, promiseReject!];
}) as CreatePromise;
\`\`\`
***

***
\`\`\`json
{
    "id": "h1jerckobtbqxp1ks1g3tdre8w",
    "create_at": 1647593186840,
    "update_at": 1700506326162,
    "delete_at": 0,
    "username": "vavolkov1",
    "auth_data": "",
    "auth_service": "",
    "email": "valeksandrovolkov@sberbank.ru",
    "email_verified": true,
    "nickname": "",
    "first_name": "Vladimir",
    "last_name": "Volkov [Frontend]",
    "position": "Frontend (Сбермаркет, Готовая еда, Супер Шеф)",
    "roles": "system_user system_admin",
    "allow_marketing": true,
    "props": {
        "customRoles": ["Curator"],
        "customStatus": "{\\"emoji\\":\\"sneezing_face\\",\\"text\\":\\"\\",\\"duration\\":\\"this_week\\",\\"expires_at\\":\\"2022-10-15T20:59:59.999Z\\"}"
    },
    "notify_props": {
        "auto_responder_active": "false",
        "auto_responder_message": "Hello, I am out of office and unable to respond to messages.",
        "channel": "true",
        "comments": "never",
        "desktop": "mention",
        "desktop_notification_sound": "Bing",
        "desktop_sound": "true",
        "desktop_threads": "all",
        "email": "false",
        "email_threads": "all",
        "first_name": "false",
        "mention_keys": "",
        "push": "mention",
        "push_status": "away",
        "push_threads": "all"
    },
    "last_password_update": 1691526913311,
    "last_picture_update": 1647593684793,
    "locale": "en",
    "timezone": {
        "automaticTimezone": "Europe/Moscow",
        "manualTimezone": "",
        "useAutomaticTimezone": "true"
    },
    "mfa_active": true,
    "terms_of_service_id": "apoun4s4mprx9nrwcpx1qyxede",
    "terms_of_service_create_at": 1701863570812,
    "disable_welcome_email": false
}
\`\`\`
***
`;

export const sampleMarkdownText = `![.](https://cdn.tlgrm.app/stickers/621/049/6210496c-92a4-41e6-9d9e-b3b3b7103c09/192/3.webp)
***
### Новый процесс управления гостевыми УЗ

Коллеги, мы начали переход на новый процесс управления гостевыми учетными записями.

Благодаря ему добавлять гостей в Mattermost станет легче - уйдет этап согласований по почте. Для этого мы внедряем новую ролевую модель – Membership Management Control (или MMC), и первой ступенькой этой модели становится **роль Куратора**. **Куратором может стать сотрудник SberDevices с учетной записью типа member.**

**Возможности и обязанности:**

*   Куратор регистрирует учетные записи типа "гость" (гости - пользователи Mattermost, которые не относятся к SberDevices)
*   Куратор управляет гостями внутри самого mattermost - без согласования по почте и привлечения администраторов системы
*   Куратор может смотреть список своих гостей, продлевать или забирать их доступ в Mattermost и передавать гостей другому Куратору
*   Куратор отвечает за нахождение гостей в Mattermost и их доступ к информации

По старому процессу за гостей отвечал тимлид от SD, который направлял на почту заявку на добавление гостей. :exclamation: **Начиная с 22 января все гости могут быть добавлены в mattermost только Куратором.** :exclamation: Мы понимаем, что для перехода на новый процесс потребуется время, и готовы вам с этим помочь.

 **:point_right: [Видео инструкция по новому процессу (3 минуты)](https://sbervideo.sberbank.ru/watch/5ZALPtkZ8b8WtWuopGX)**
*открывается под банковским vpn или из сети банка wi-fi Sber*

### Как стать Куратором?

1. Для получения роли Куратора необходимо отправить заявку - нажать на плюсик в левой части меню (рядом с названием пространства) и выбрать кнопку New curator (Новый куратор) => [инструкция](https://confluence.sberbank.ru/x/fodREwM)
2. Далее необходимо ознакомиться с [Правилами и политиками для роли Куратора](https://confluence.sberbank.ru/pages/viewpage.action?pageId=13070803665)
3. После одобрения заявки вы сможете регистрировать новых гостей => [инструкция](https://confluence.sberbank.ru/x/fodREwM)
4. Вы также будете добавлены в канал Инструкции для Кураторов, в котором находится вся необходимая информация

По всем вопросам касательно нового процесса вы можете написать в канал технической поддержки **[mattermost_support](https://mm.sberdevices.ru/sberdevices/channels/mattermost_support)** или **[менеджеру технической поддержки ММ](https://mm.sberdevices.ru/sberdevices/messages/@support_manager_mm)** - мы поможем вам пройти по новому процессу и покажем основные инструменты для работы.

### Важные ссылки

> [Правила и политики при добавлении гостей в mattermost](https://confluence.sberbank.ru/pages/viewpage.action?pageId=13070803670)
>  
> [Правила и политики для роли "Куратор"](https://confluence.sberbank.ru/pages/viewpage.action?pageId=13070803665)
>  
> [Инструкции для Куратора в Confluence](https://confluence.sberbank.ru/x/fodREwM)
>  
> [Видео инструкция по новому процессу (3 минуты)](https://sbervideo.sberbank.ru/watch/5ZALPtkZ8b8WtWuopGX)
> *открывается под банковским vpn или из сети банка wi-fi Sber*
`;
