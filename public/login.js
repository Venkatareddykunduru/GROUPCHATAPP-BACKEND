document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await axios.post('http://localhost:3000/auth/login', {
            email:email,
            password:password
        });
        if (response.status === 200) {
            alert('Login successful. Redirecting to home page.');
            window.localStorage.setItem('token', response.data.token); // Store the token
            //const userId=parseInt(response.data.userId,10);
            window.localStorage.setItem('userid', response.data.userid);
            window.location.href='home.html';
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert(error.response.data.message);
    }
});