import appBuilder from "./app.js"

const start = async () => {
    try
    {
        const fastify = await appBuilder()
        await fastify.listen({ port:3000 })
    }
    catch (err)
    {
        console.log(err)
        process.exit(1)
    }
}

start()