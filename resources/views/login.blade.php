<!DOCTYPE html>
<html>
    <head>
     <title>WTFnote</title>
     <meta charset="utf-8">
     <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
     <link rel="stylesheet" href="css/bootstrap.css">
     <link rel="stylesheet" href="css/style.css">
    </head>

    <body id="login">
        <div class="container">
            <div class="row">
                <div class="col align-self-center">
                    <form action="./login" method="POST">
                    <div class="input-group mb-3">
                        <input type="hidden" name="email" value="{{ env('APP_NAME') }}">
                        <input type="password" name="password" class="form-control"
                               placeholder="Passphrase" autofocus>
                        <div class="input-group-prepend">
                            <button class="btn btn-primary">Login</button>
                        </div>
                    </div>
                    <div class="col">
                        <input type="checkbox" id="remember_me" name="_remember_me" checked />
                        <label for="remember_me">Keep me logged in</label>
                    </div>
                    {{ csrf_field() }}
                    </form>
                </div>
            </div>
        </div>
    </body>
</html>
