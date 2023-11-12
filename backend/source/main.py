from enum import Enum, unique
import asyncio
from typing import Any
from aiohttp import web
import aiohttp_cors


@unique
class Difficulty(int, Enum):
    EASY = 0
    MEDIUM = 1
    HARD = 2
    VERY_HARD = 3
    IMPOSSIBLE = 4


difficulty_to_password = {
    Difficulty.EASY: "5612",
    Difficulty.MEDIUM: "32276",
    Difficulty.HARD: "bzcd",
    Difficulty.VERY_HARD: "h4b2",
    Difficulty.IMPOSSIBLE: "z+1c",
}


async def handle_post(request: web.Request):
    try:
        data: dict[str, Any] = await request.json()
        difficulty = data.get('difficulty', None)
        password = data.get('password', None)

        if difficulty is None or password is None:
            return web.Response(text="Missing difficulty or password argument", status=400)

        return web.json_response({
            "done": True,
            "result": password == difficulty_to_password[Difficulty(difficulty)],
        })
    except Exception as e:
        return web.json_response({
            "done": False,
            "result": 'error',
            "exception": str(e),
        })


async def init_app():
    app = web.Application()

    cors = aiohttp_cors.setup(app, defaults={
        "*": aiohttp_cors.ResourceOptions(
            allow_credentials=True,
            expose_headers="*",
            allow_headers="*",
            allow_methods=["POST", "GET", "OPTIONS"]
        )
    })

    app.router.add_post('/check_pass', handle_post)

    for route in list(app.router.routes()):
        cors.add(route)

    return app


loop = asyncio.get_event_loop()
app = loop.run_until_complete(init_app())

web.run_app(app, port=8082)
