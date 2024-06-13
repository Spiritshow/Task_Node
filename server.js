const http = require('http');
const url = require('url');


class Router {
    constructor(){
        this.routes = {
            GET: {},
            POST: {},
            PUT: {},
            DELETE: {}
        };
    }

    addRoute(method, path, handler) {
        if (!this.routes[method]) {
            this.routes[method] = {};
        }
        this.routes[method][path] = handler;
    }

    getHandler(method, path){
        return this.routes[method]?.[path];
    }

    async handleRequest(req, res) {
        const parseUrl = url.parse(req.url, true);
        const path = parseUrl.pathname;
        const method = req.method;

        res.setHeader('Contant-Type', 'application/json');

        const handler = this.getHandler(method, path);

        if(handler) {
            try{
                await handler(req,res,parseUrl.query);
            } catch (err){
                this.handleError(res, 500, 'Internal Server Error')
            }
        }else if (!this.routes[method]) {
            this.handleError(res, 405, 'Method Not Allowed');
        }else{
            this.handleError(res, 404,'Not Found');
        }
    }

    handleError(res, statusCode, message) {
        res.statusCode = statusCode;
        res.end(JSON.stringify({error: message}));
    }
}

//Функция для чтения запроса
const readRequestBody = async (req) => {
    let body = '';
    for await (const chunk of req){
        body += chunk;
    }
    return JSON.parse(body);
};

//создание экземпляра маршрутизатора
const router = new Router();


//Добавление маршрутов {
router.addRoute('GET', '/api/resourse', async (req, res) => {
    res.statusCode = 200;
    res.end(JSON.stringify({message: "GET request receives"}));
});

router.addRoute('POST', '/api/resourse', async(req, res) => {
    const data = await readRequestBody(req);
    res.statusCode = 201;
    res.end(JSON.stringify({message: 'POST request receives', data}));
});

router.addRoute('PUT', '/api/resourse', async(req,res) => {
    const data = await readRequestBody(req);
    res.statusCode = 200;
    res.end(JSON.stringify({message: 'PUT request receives'}));
});

router.addRoute('DELETE', '/api/resourse', async(req, res) => {
    res.statusCode = 200;
    res.end(JSON.stringify({message: 'DELETE request received'}));
})
//}

// Гл обработчик запросов
const requestHandler = async (req, res) => {
    await Router.handleRequest(req,res);
}
//Создание и запуск сервера
const server = http.createServer(requestHandler);

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server run port ${PORT}`);
})
