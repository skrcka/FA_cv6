from collections import defaultdict
from enum import Enum, unique
import asyncio
import time
from typing import Any
from aiohttp import web
import aiohttp_cors


request_counts = defaultdict(int)
request_timestamps = defaultdict(int)

MAX_REQUESTS = 5
TIME_FRAME = 60


def is_rate_limited(ip):
    if time.time() - request_timestamps[ip] > TIME_FRAME:
        request_counts[ip] = 0
        request_timestamps[ip] = time.time()

    if request_counts[ip] > MAX_REQUESTS:
        return True

    request_counts[ip] += 1
    return False


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
        client_ip = request.remote

        if is_rate_limited(client_ip):
            return web.json_response({
                "done": False,
                "result": 'error',
                "exception": 'Rate limit exceeded',
            }, status=429)
        data: dict[str, Any] = await request.json()
        difficulty = data.get('difficulty', None)
        password = data.get('password', None)

        if difficulty is None or password is None:
            return web.json_response({
                "done": False,
                "result": 'error',
                "exception": 'Missing difficulty or password argument',
            }, status=400)

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
