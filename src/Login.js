import React from 'react';

function Login() {
    return (
        <div className="App">
            <header className="App-header">
                <a className="btn-spotify" onClick={() => window.parent.postMessage('triggerAuthFlow', "*")}>
                    Login with Spotify 
                </a>
            </header>
        </div>
    );
}

export default Login;