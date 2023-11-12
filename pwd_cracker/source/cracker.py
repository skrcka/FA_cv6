from enum import Enum, unique
from itertools import combinations
import json
import requests


@unique
class Difficulty(int, Enum):
    EASY = 0
    MEDIUM = 1
    HARD = 2
    VERY_HARD = 3
    IMPOSSIBLE = 4


def get_all_combinations(n, x):
    return ("".join(i) for i in combinations(x, n))


def get_passwords_combinations(difficulty):
    match difficulty:
        case Difficulty.EASY:
            return get_all_combinations(4, "0123456789")
        case Difficulty.MEDIUM:
            return get_all_combinations(5, "0123456789")
        case Difficulty.HARD:
            return get_all_combinations(4, "abcdefghijklmnopqrstuvwxyz")
        case Difficulty.VERY_HARD:
            return get_all_combinations(4, "abcdefghijklmnopqrstuvwxyz0123456789")
        case Difficulty.IMPOSSIBLE:
            return get_all_combinations(5, "".join([chr(i) for i in range(0, 255)]))


def test_password(difficulty, password):
    while True:
        try:
            response = requests.post(
                "http://127.0.0.1:8082/check_pass",
                json={"difficulty": difficulty, "password": password},
            )
            break
        except requests.exceptions.ConnectionError:
            print("Connection error, retrying...")
            pass
    content = json.loads(response.content)
    return content['result']


def main():
    DIFFICULTY = 0

    while True:
        for password in get_passwords_combinations(DIFFICULTY):
            if test_password(DIFFICULTY, password):
                print(f"Password cracked: {password}")
                break


if __name__ == "__main__":
    main()
