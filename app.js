// plugin.js
import fastifyStatic from 'fastify-static';
import path from 'path';
import { fileURLToPath } from 'url';
import pointOfView from 'point-of-view';
import pug from 'pug';
import { api, apiURL } from './src/api.js'
import fastifyCookie from 'fastify-cookie'

export default async function plugin(fastify, options) {
    fastify.register(pointOfView, {
        engine: {
            ejs: pug,
        }
    })
    fastify.register(fastifyCookie)
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    fastify.register(fastifyStatic, {
        root: path.join(__dirname, 'assets'),
        prefix: '/assets/', // optional: default '/'
    })

    fastify.get('/', async function (req, reply) {
        let msgsR = await api(`${apiURL}/v1/msgs`, { sessionCookie: req.cookies.session })
        let msgs = msgsR.messages
        reply.view('/views/investments.pug')
    })

    fastify.get('/assets/js/api.js', async function (req, reply) {
        reply.header('Content-Type', 'text/javascript')
        reply.view('/assets/js/api.js.pug', {
            apiURL: apiURL,
        })
    })

    fastify.get('/signin', function (req, reply) {
        reply.view('/views/signin.pug')
    })
    // login is temporary until codespaces fixes it
    fastify.get('/login', function (req, reply) {
        reply.view('/views/signin.pug')
    })

    fastify.get('/tokenize', function (req, reply) {
        reply.view('/views/tokenize.pug')
    })

    fastify.get('/identity', function (req, reply) {
        reply.view('/views/identity.pug')
    })

    fastify.get('/title', function (req, reply) {
        reply.view('/views/title.pug')
    })

    fastify.get('/wallet', function (req, reply) {
        reply.view('/views/wallet.pug')
    })

    fastify.get('/tokenize-confirm', function (req, reply) {
        reply.view('/views/tokenizeConfirm.pug')
    })

    fastify.get('/token-issued', function (req, reply) {
        reply.view('/views/tokenIssued.pug')
    })

    fastify.get('/investments', function (req, reply) {
        reply.view('/views/investments.pug')
    })

    fastify.get('/assetregister', function (req, reply) {
        reply.view('/views/assetregister.pug')
    })

    fastify.get('/assettoken', function (req, reply) {
        reply.view('/views/assettoken.pug')
    })

    fastify.get('/titletokens', function (req, reply) {
        reply.view('/views/titletokens.pug')
    })

    fastify.get('/admin', function (req, reply) {
        reply.view('/views/admin.pug')
    })

    fastify.get('/myassets', function (req, reply) {
        reply.view('/views/myassets.pug')
    })

    fastify.get('/organization/:orgId/assets', function (req, reply) {
        reply.view('/views/orgassets.pug', {
            orgId: req.params.orgId
        })
    })

    fastify.get('/organization/:orgId', function (req, reply) {
        reply.view('/views/organization.pug', {
            orgId: req.params.orgId
        })
    })

    fastify.get('/organizations', function (req, reply) {
        reply.view('/views/organizations.pug')
    })

    fastify.get('/create-org', function (req, reply) {
        reply.view('/views/createorg.pug')
    })

    fastify.get('/assets/:assetId', function (req, reply) {
        reply.view('/views/assetInfo.pug', {
            assetId: req.params.assetId
        })
    })

    fastify.get('/sales', function (req, reply) {
        reply.view('/views/sales.pug')
    })

    fastify.setNotFoundHandler(function (request, reply) {
        console.log("not found handler")
        reply
            .code(404)
            //   .type('text/plain')
            .view('/views/404.pug')
    })

    fastify.setErrorHandler(function (error, request, reply) {
        console.log("error handler", error)
        request.log.warn(error)
        let statusCode = error.statusCode >= 400 ? error.statusCode : 500
        if (statusCode === 404) {
            reply
                .code(statusCode)
                //   .type('text/plain')
                .view('/views/404.pug')
            return
        }
        reply
            .code(statusCode)
            .view('/views/error.pug', { message: statusCode >= 500 ? 'Internal server error' : error.message })
    })

}
