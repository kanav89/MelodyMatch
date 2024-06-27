from fastapi import FastAPI
from fastapi.responses import RedirectResponse, Response

app = FastAPI()


@app.get("/")
def root():
    return {"Hello": "World"}


@app.get("/cookieset")
def cookie_set(response: Response):
    response.set_cookie(key="works", value="here is your data")
    return "My cookies got set!"


@app.get("/cookiefail")
def cookie_fail(response: Response):
    response.set_cookie(key="works", value="here is your data")
    return RedirectResponse("/")


@app.get("/cookieset2")
def cookie_set2(response: Response):
    # This works, but appears to fall short of what the documentation claims, noted below.
    response.set_cookie(key="works", value="here is your data")
    response.status_code = 307
    response.headers["location"] = "/"
    return response


@app.get("/cookieset3", response_class=RedirectResponse)
def cookie_set3() -> RedirectResponse:
    # Proposed by @mcauto in comments below; sets cookie correctly. Pretty close to "ideal" behavior, I think the best behavior would be /cookieset4
    response = RedirectResponse(url="/4s")
    response.set_cookie(key="works", value="here is your data", domain="127.0.0.1")
    return response


@app.get("/cookieset4", response_class=RedirectResponse)
def cookie_set4(response: RedirectResponse) -> RedirectResponse:
    response.set_cookie(key="works", value="here is your data", domain="127.0.0.1")
    return response
