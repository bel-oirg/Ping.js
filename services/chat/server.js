import appBuilder from "./app.js"

const start = async () => {
    try
    {
        const fastify = await appBuilder()
        await fastify.listen({ port:8005, host: '0.0.0.0' })
    }
    catch (err)
    {
        console.log(err)
    }
}

start()