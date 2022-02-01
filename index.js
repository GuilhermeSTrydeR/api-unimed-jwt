const express = require('express');
const app = express();
const port = 3000;
const sql = require("./dboperation.js");
const bodyParser = require('body-parser');
const { json } = require('body-parser');
const jwt = require('jsonwebtoken');

//chave secreta incorporada ao JWT
const SECRET = 'qpwoalskfdj';



app.use(bodyParser.json());

// essa middle-function servira para verificar o toke JWT
function verifyJWT(req, res, next){
    const token = req.headers['x-access-token'];
    jwt.verify(token, SECRET, (err, decoded) => {
        if(err) return res.status(401).end();
        
        req.userId = decoded.userId;
        next();
    })
}

app.get('/', (req, res) => {
    res.json({ message: "Tudo Rodando OK!"});
})

app.post('/login', (req, res) => {
    if(req.body.user === 'teste' && req.body.password === '12345'){
        const token = jwt.sign({userId: 1}, SECRET, {expiresIn: 600})
        return res.json({auth: true, token});
    }
    res.status(401).end();
})

app.get('/query', verifyJWT, (req, res) => {
    sql.getdata_withQuery(req.body.codigo).then((result) => {
        res.json(result[0].map(p => {
            //apos recebido os dados via corpo de requisicao na funcao, eh criado um JSON para retornar mais abaixo as informacoes no endpoint
            let jsonResult = {
            "codigo" : p.CODIGO,
            "status" : p.STATUS
            }
            //aqui eh o retorno da funcao que contem o JSON 
            return jsonResult;
        }));
    });
})

//'node index.js' para subir o servidor
app.listen(port, () => {
    console.log(`Aplicativo rodando na porta: ${port}`);
})
