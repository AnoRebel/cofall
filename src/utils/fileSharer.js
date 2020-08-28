import React, { useReducer, useEffect } from 'react';
// import randomstring from 'randomstring';
import Peer from 'peerjs';


const FileSharer = props => {
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        { peer: new Peer(), my_id: '', peer_id: '', initialized: false, files: [] }
    );

    const connect = () => {
		let peer_id = state.peer_id;
		let connection = state.peer.connect(peer_id);

		setState({
		    conn: connection
		}, () => {
			state.conn.on('open', () => {
				setState({
					connected: true
				});
			});
			state.conn.on('data', onReceiveData);
		});
	};

    useEffect(() => {
        state.peer.on('open', (id) => {
			console.log('My peer ID is: ' + id);
			setState({
				my_id: id,
				initialized: true
			});
		});

		state.peer.on('connection', (connection) => {
			console.log('someone connected');
			console.log(connection);

			setState({
				conn: connection
			}, () => {
				state.conn.on('open', () => {
					setState({
						connected: true
					});
				});

				state.conn.on('data', onReceiveData);
			});
		});

        return () => state.peer.destroy();
    })

    const sendFile = event => {
	    console.log(event.target.files);
	    let file = event.target.files[0];
	    let blob = new Blob(event.target.files, {type: file.type});

	    state.conn.send({
	        file: blob,
	        filename: file.name,
	        filetype: file.type
	    });
	};

    const onReceiveData = data => {
		console.log('Received', data);

		let blob = new Blob([data.file], {type: data.filetype});
		let url = URL.createObjectURL(blob);

		addFile({
			'name': data.filename,
			'url': url
		});

	};

	const addFile = file => {

		let file_name = file.name;
		let file_url = file.url;

		let files = state.files;
		let file_id = "randomstring"; //randomstring.generate(5);

		files.push({
			id: file_id,
			url: file_url,
			name: file_name
		});

		setState({
			files: files
		});
	};

	const handleTextChange = event => {
		setState({
		  peer_id: event.target.value
		});
	};

    const renderFile = file => {
		return (
			<tr key={file.id}>
				<td>
					<a href={file.url} download={file.name}>{file.name}</a>
				</td>
			</tr>
		);
	};

    const renderConnected = () => {
		return (
			<div>
				<hr />
				<div>
					<input type="file" name="file" id="file" className="mui--hide" onChange={sendFile} />
					<label htmlFor="file" className="mui-btn mui-btn--small mui-btn--primary mui-btn--fab">+</label>
				</div>
				<div>
					<hr />
					{state.files.length ? renderListFiles() : renderNoFiles()}
				</div>
			</div>
		);
	};

	const renderListFiles = () => {
		return (
			<div id="file_list">
      			<table className="mui-table mui-table--bordered">
					<thead>
					  <tr>
					    <th>{props.opts.file_list_label || 'Files shared to you: '}</th>
					  </tr>
					</thead>
					<tbody>
						{state.files.map(renderFile)}
					</tbody>
				</table>
			</div>
		);
	};

    const renderNoFiles = () => {
		return (
			<span id="no_files_message">
				{props.opts.no_files_label || 'No files shared to you yet'}
			</span>
		);
	}

	const renderNotConnected = () => {
		return (
			<div>
				<hr />
				<div className="mui-textfield">
					<input type="text" className="mui-textfield" onChange={handleTextChange} />
					<label>{props.opts.peer_id_label || 'Peer ID'}</label>
				</div>
				<button className="mui-btn mui-btn--accent" onClick={connect}>
					{props.opts.connect_label || 'connect'}
				</button>
			</div>
		);
	};

    let result;

    if(state.initialized){
        result = (
            <div>
                <div>
                    <span>{props.opts.my_id_label || 'Your PeerJS ID:'} </span>
                    <strong className="mui--divider-left">{state.my_id}</strong>
                </div>
                {state.connected ? renderConnected() : renderNotConnected()}
            </div>
        );
    } else {
        result = <div>Loading...</div>;
    }

    return result;
}

// FileSharer.propTypes: {
//     opts: React.PropTypes.object
// };

export default FileSharer;
