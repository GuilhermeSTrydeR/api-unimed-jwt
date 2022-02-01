para gerar um token que possa ser validade nessa API, utilizar a rota /login com usuario e senha, sera retornado um token e essa token devera ser incluido no cabecalho da rota /query, utilizando 'x-access-token'

cabecalho da rota /query
_______________________________________

header          |    value
Content-Type    |    application/json
x-access-token  |    [token_gerado]
_______________________________________


cabecalho da rota /logout
_______________________________________

header          |    value
x-access-token  |    [token_gerado]
_______________________________________
