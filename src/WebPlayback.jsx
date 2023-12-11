import React, { useState, useEffect } from 'react';

const track = {
    name: "",
    album: {
        images: [
            { url: "" }
        ]
    },
    artists: [
        { name: "" }
    ]
}



function WebPlayback(props) {

    const [is_paused, setPaused] = useState(false);
    const [is_active, setActive] = useState(false);
    const [player, setPlayer] = useState(undefined);
    const [current_track, setTrack] = useState(track);
    const [total_duration, setDuration] = useState("00:00");
    const [curr_time, setCurTime] = useState("00:00");
    const [slider_val, setSlider] = useState(0);
    const [tot_sec, setTotSec] = useState(0);

    useEffect(() => {
 
        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;

        document.body.appendChild(script);

        window.onSpotifyWebPlaybackSDKReady = () => {

            const player = new window.Spotify.Player({
                name: 'Lucid Web Player for Spotify',
                getOAuthToken: cb => { cb(props.token); },
                volume: 1
            });

            setPlayer(player);

            player.addListener('ready', ({ device_id }) => {
                console.log('Ready with Device ID', device_id);
            });

            player.addListener('not_ready', ({ device_id }) => {
                console.log('Device ID has gone offline', device_id);
            });

            player.addListener('player_state_changed', ( state => {
                
                setTotSec(Math.floor(state.duration / 1000));
                
                let dur_sec = Math.floor(state.duration / 1000 % 60);
                let dur_min = Math.floor(state.duration / 1000 / 60);
                let dur_str = dur_min + (dur_sec < 10 ? ":0" : ":") + dur_sec;
                setDuration(dur_str);


                if (!state) {
                    return;
                }

                setTrack(state.track_window.current_track);
                setPaused(state.paused);

                player.getCurrentState().then( state => { 
                    (!state)? setActive(false) : setActive(true) 
                });

            }));


            setInterval(seekUpdate, 1000);
            function seekUpdate() {
                player.getCurrentState().then( state => {
                    if (!state) {
                        return;
                    }
                let pos_min = Math.floor(state.position / 1000 / 60);
                let pos_sec = Math.floor(state.position / 1000 % 60);
                let pos_str = pos_min + (pos_sec < 10 ? ":0" : ":")  + pos_sec;
                setCurTime(pos_str);
                setSlider(Math.floor(state.position / 1000));
                });
            }

            player.connect();
            
        };
        
    }, []);

    if (!is_active) { 
        return (
            <>
                <div className="container">
                    <div className="main-wrapper">
                        <b> Instance created! Connect your Spotify instance to your listening device in the Spotify app! </b>
                    </div>
                </div>
            </>)
    } else {
        return (
            <>
                <div className="container">
                    <div className="main-wrapper">
                        <img src={current_track.album.images[0].url} className="now-playing__cover" alt="" />
                        </div>    
                </div>
                <div className="now-playing_bottom">
                        <div className="now-playing__name">{current_track.name}</div>
                </div>
                <div className='now-playing_bottom'>
                        <div className="now-playing__artist">{current_track.artists[0].name}</div> 
                </div>
                <div className="slider_container">
                <div className="current-time">{curr_time}</div>
                <input type="range" min="0" max={tot_sec}
                    className="seek_slider" style={{background:`linear-gradient(to right, green 0%, green ${getGradientPercentage(slider_val, tot_sec)}, ${getGradientPercentage(slider_val, tot_sec)}, black 100%)`}} value={slider_val} onChange={(e) => {seekTo(e.target.value, player); setSlider(e.target.value); getGradientPercentage(e.target.value, tot_sec)}}></input>
                <div className="total-duration">{total_duration}</div>
                </div>


                <div className='now-playing_bottom buttons'>
                            <i className="fa fa-step-backward fa-2x prev-track" style={{fontStyle: "36px"}} onClick={() => { player.previousTrack(); }}></i>

                            <i className={"fa fa-5x playpause-track " + (is_paused ? 'fa-play-circle' : 'fa-pause-circle')} onClick={() => { player.togglePlay() }}></i>

                
                            <i className="fa fa-step-forward fa-2x next-track" style={{fontStyle: "36px"}} onClick={() => {player.nextTrack(); }}></i>
                        </div>
            </>
        );
    }
    
}

const getGradientPercentage = (value, td) => {
    // Calculate the percentage based on the slider value
    const percentage = (value) / (td) * 100;
    return `${percentage}%`;
  };

function seekTo(pos, player) {
    player.seek(pos * 1000);
}

export default WebPlayback
