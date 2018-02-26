<!DOCTYPE html>
<html>
    <head>
        <title>WTFNote Settings</title>
        <meta charset="utf-8">
        <link rel="stylesheet" href="css/style.css">
        <link rel="stylesheet" href="css/bootstrap.css">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    </head>

    <body>
        
        <div class="container" style="margin-top: 20px">
              @if($errors->any())
                <div style="background: rgba(255, 0, 0, 0.1); padding: 10px; margin: 20px 0;">
                    <h3>Errors</h3>
                    <p>{{ $errors->first() }}</p>
                </div>
              @endif
			  <form action="./settings" method="POST">
			  <div class="form-group">
				<label for="oldpass">Old Password</label>
				<input type="password" class="form-control" id="oldpass" name="oldpass" placeholder="Password">
			  </div>
			  <div class="form-group">
				<label for="newpass">New Password</label>
				<input type="password" class="form-control" id="newpass" name="newpass" placeholder="Password">
			  </div>
			  <div class="form-group">
				<label for="confpass">Confirm New Password</label>
				<input type="password" class="form-control" id="confpass" name="confpass" placeholder="Password">
			  </div>
		      <div class="row">
				  <div class="col-6">
					  <button type="submit" class="btn btn-primary">Submit</button>
				  </div>
				  <div class="col-6 text-right">
					  <a href="./" class="btn btn-secondary">Go back to notes</a>
				  </div>
			  </div>
			  </form>
			</div>
        </div>

    </body>
</html>
