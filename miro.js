const puppeteer = require('puppeteer');

// 定数 (後述)
const LOGIN_URL = 'https://accounts.google.com/o/oauth2/auth?access_type=offline&client_id=1062019541050-8mvc17gv9c3ces694hq5k1h6uqio1cfn.apps.googleusercontent.com&redirect_uri=https://miro.com/social/google/&response_type=code&scope=profile%20email&include_granted_scopes=true';
const LOGIN_USER = "";
const LOGIN_PASS = '';
const TARGET_BOARD_ID = '';
const TARGET_URL = `https://miro.com/app/board/${TARGET_BOARD_ID}/`;
const LOGIN_USER_SELECTOR = "#identifierId";
const LOGIN_PASS_SELECTOR = '#password input[type="password"]' ;
const LOGIN_USER_SUBMIT_SELECTOR = '#identifierNext';
const LOGIN_PASS_SUBMIT_SELECTOR =  '#passwordNext'

/**
 * スクリーンショットのファイル名を取得します。
 * @returns YYYYMMDD-HHMMSS.png 形式の文字列
 */
function getFilename() {
    // タイムゾーンを調整して文字列化します。
    const offset = (new Date()).getTimezoneOffset() * 60000;
    const iso = (new Date(Date.now() - offset)).toISOString();
    const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
    return `${m[1]}${m[2]}${m[3]}-${m[4]}${m[5]}${m[6]}.png`;
}

/**
 * メイン処理です。
 */
(async () => {
    const browser = await puppeteer.launch({ // ブラウザを開く
        headless: true, // ブラウザを表示するか (デバッグの時は false にしたほうが画面が見えてわかりやすいです)
    });
    const page = await browser.newPage(); // 新規ページ
    await page.setViewport({ width: 1440, height: 900 }); // ビューポート (ウィンドウサイズ)
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36')
    await page.setExtraHTTPHeaders({ // 必要な場合、HTTPヘッダを追加
        'Accept-Language': 'ja'
    });


    // ログイン画面でログイン
    await page.goto(LOGIN_URL);
    await page.waitForSelector(LOGIN_USER_SELECTOR);
    await page.type(LOGIN_USER_SELECTOR, LOGIN_USER, { delay: 5 }); // ユーザー名入力
    await page.click(LOGIN_USER_SUBMIT_SELECTOR);
    await page.waitForSelector(LOGIN_PASS_SELECTOR, { visible: true });

    await page.type(LOGIN_PASS_SELECTOR, LOGIN_PASS, { delay: 10 }); // パスワード入力
    await page.click(LOGIN_PASS_SUBMIT_SELECTOR);

    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 });

    // ログイン後の画面に移動
    await page.goto(TARGET_URL);
    await page.waitFor(10000);
    // スクリーンショット (フルページ)
    const filename = getFilename();
    await page.screenshot({ path: filename, fullPage: true });
    // ブラウザを閉じる
    await browser.close();
})();