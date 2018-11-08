function auth() { }

auth.checked = false;

auth.signedIn = function () {
    var url = util.parameterGet("url");
    if (url) window.location = url;
};

io.openDb();
firebase.auth().signOut(); 
    document.querySelector('#signIn').addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      var email = document.querySelector('#email').value;
      var password = document.querySelector('#password').value;
      firebase.auth().signInWithEmailAndPassword(email, password).then(function (user) { auth.checked = true; }).catch(function (error) { auth.checked = false;firebase.auth().signOut(); alert(error.message);});
      firebase.auth().onAuthStateChanged(function (user) { if (user && auth.checked) auth.signedIn();});
      });
    document.querySelector('#forgot').addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var email = document.querySelector('#email').value;
        firebase.auth().sendPasswordResetEmail(email);
        alert("Thank you! Now c heck your email.");
    });
    document.querySelector('#register').addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var email = document.querySelector('#email').value;
        var password = document.querySelector('#password').value;
        firebase.auth().createUserWithEmailAndPassword(email, password).then(function (user) { auth.checked = true; auth.signedIn(); }).catch(function (error) {
            alert(error.message);
        });
    });