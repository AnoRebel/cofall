<>
      <div id="frame">
        <div id="sidepanel">
          <div id="profile">
            <div className="wrap">
              <img id="profile-img" src="/avatar.png" className="online" alt="" />
              <p>Ano Rebel</p>
              <div
                className="expand-button"
                onClick={togglePanel}
              >
                <FontAwesomeIcon icon={panel} />
              </div>
              <div id="status-options">
                <ul>
                  <li
                    id="status-online"
                    className="active"
                    onClick={el => handleStatus(el.currentTarget)}
                  >
                    <span className="status-circle"></span> <p>Online</p>
                  </li>
                  <li id="status-away" onClick={el => handleStatus(el.currentTarget)}>
                    <span className="status-circle"></span> <p>Away</p>
                  </li>
                  <li id="status-busy" onClick={el => handleStatus(el.currentTarget)}>
                    <span className="status-circle"></span> <p>Busy</p>
                  </li>
                  <li id="status-offline" onClick={el => handleStatus(el.currentTarget)}>
                    <span className="status-circle"></span> <p>Offline</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div id="contacts">
            <ul>
              <li className="contact active">
                <div className="wrap">
                  <span className="contact-status online"></span>
                  <img src="http://emilcarlsson.se/assets/harveyspecter.png" alt="" />
                  <div className="meta">
                    <p className="name">Harvey Specter</p>
                    <p className="preview">
                      Wrong. You take the gun, or you pull out a bigger one. Or, you call their
                      bluff. Or, you do any one of a hundred and forty six other things.
                    </p>
                  </div>
                </div>
              </li>
            </ul>
          </div>
          <div id="bottom-bar">
            <button id="addcontact">
              <FontAwesomeIcon icon={faUserPlus} /> <span>Add contact</span>
            </button>
            <button id="settings">
              <FontAwesomeIcon icon={faCog} /> <span>Settings</span>
            </button>
          </div>
        </div>
        <div className="content">
          <div className="contact-profile">
            <img src="/avatar.png" alt="" />
            <p>Harvey Specter</p>
          </div>
          <div className="messages">
            <ul>
              <li className="replies">
                <img src="http://emilcarlsson.se/assets/harveyspecter.png" alt="" />
                <p>Excuses don't win championships.</p>
              </li>
              <li className="sent">
                <img src="http://emilcarlsson.se/assets/mikeross.png" alt="" />
                <p>Oh yeah, did Michael Jordan tell you that?</p>
              </li>
            </ul>
          </div>
          <div className="message-input">
            <div className="wrap">
              <input type="text" placeholder="Write your message..." />
              <FontAwesomeIcon onClick={toggleMic} icon={mic} className="attachment" />
              <button className="submit">
                <FontAwesomeIcon icon={faPaperPlane} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>