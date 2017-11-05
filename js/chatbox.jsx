function Spinner() {
    return <div class="spinner">loading...</div>;
}

function Logs(props) {
  if (props.logs.length === 0) {
    return <p class="center">No activities yet</p>
  }

  return <ul>
    {
      props.logs.map((log) => <li>
        {
          log.user === '!' ? <p class="notice">{log.time} {log.message}</p> :
          [
            <span class="time">{log.time}</span>,
            <span class="user">{log.user}</span>,
            <span class="message">{log.message}</span>
          ]
        }
      </li>)
    }
  </ul>;
}

class ChatBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: true,
      unreadCount: 0,
      address: props.address,
      loading: true,
      logs: []
    };
  }

  parseMessage(msg = '') {
    if (!msg) return {};
    // Remove term color
    const txt = msg.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
    const time = txt.match(/^\[\d+:\d+:\d+\] /g, '')[0].replace(/[^\d\:]/g, '');

    let user = '!';
    let message = '';

    // User column
    const uc = txt.replace(/^\[\d+:\d+:\d+\]\s\]/).match(/<[^<]+>/);
    if (uc && uc[0]) {
      user = uc[0].replace(/<.+\s([a-zA-Z\w]+\])?|<|>/ig, '');
      message = txt.split(/<.+>\s/ig).pop();
    } else {
      message = txt.replace(/\[\d+:\d+:\d+\]\s?|\[.+\]\:?\s/g, '');
    }

    return { time, user, message };
  }

  componentWillMount() {
    const ws = new WebSocket(this.state.address);

    ws.onmessage = (m) => {
      const logs = [...this.state.logs, this.parseMessage(m.data)]

      let unreadCount = this.state.unreadCount;
      if (this.state.collapsed) {
        unreadCount += 1;
      }

      this.setState(Object.assign({}, this.state, {
        logs,
        unreadCount
      }));

      const { logsContainer: c } = this;
      c && (c.scrollTop = 100000);
    };

    ws.onopen = () => {
      if (ws.readyState === 1) {
        this.setState(Object.assign({}, this.state, { loading:false }));
      }
    }

    ws.onclose = console.log;
  }

  componentDidUpdate() {
    this.logsContainer && (this.logsContainer.scrollTop = 10000);
  }

  toggle() {
    let c = this.state.unreadCount;
    if (this.state.collapsed) c = 0;
    this.setState(Object.assign({}, this.state, {
      collapsed: !this.state.collapsed,
      unreadCount: c
    }));
  }

  collapsedClass(mod = false) {
    const isCollapsed = mod ? !this.state.collapsed : this.state.collapsed;
    return this.state.collapsed ? 'collapsed' : '';
  }

  render() {
    return [
      (!this.state.collapsed &&
        <div class={`logs ${this.collapsedClass()}`} ref={el => this.logsContainer = el }>
          {(this.state.loading && <Spinner/>) || <Logs logs={this.state.logs}/>}
        </div>
      ),
      <button class={`toggle ${this.collapsedClass(true)}`} onClick={this.toggle.bind(this)}>&nbsp;
        {
          this.state.collapsed && <img width="32" height="32" src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMS4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDQ3MyA0NzMiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDQ3MyA0NzM7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iNTEycHgiIGhlaWdodD0iNTEycHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik00MDMuNTgxLDY5LjNjLTQ0LjctNDQuNy0xMDQtNjkuMy0xNjcuMi02OS4zcy0xMjIuNSwyNC42LTE2Ny4yLDY5LjNjLTg2LjQsODYuNC05Mi40LDIyNC43LTE0LjksMzE4ICAgIGMtNy42LDE1LjMtMTkuOCwzMy4xLTM3LjksNDJjLTguNyw0LjMtMTMuNiwxMy42LTEyLjEsMjMuMnM4LjksMTcuMSwxOC41LDE4LjZjNC41LDAuNywxMC45LDEuNCwxOC43LDEuNCAgICBjMjAuOSwwLDUxLjctNC45LDgzLjItMjcuNmMzNS4xLDE4LjksNzMuNSwyOC4xLDExMS42LDI4LjFjNjEuMiwwLDEyMS44LTIzLjcsMTY3LjQtNjkuM2M0NC43LTQ0LjcsNjkuMy0xMDQsNjkuMy0xNjcuMiAgICBTNDQ4LjI4MSwxMTQsNDAzLjU4MSw2OS4zeiBNMzg0LjQ4MSwzODQuNmMtNjcuNSw2Ny41LTE3Miw4MC45LTI1NC4yLDMyLjZjLTUuNC0zLjItMTIuMS0yLjItMTYuNCwyLjFjLTAuNCwwLjItMC44LDAuNS0xLjEsMC44ICAgIGMtMjcuMSwyMS01My43LDI1LjQtNzEuMywyNS40aC0wLjFjMjAuMy0xNC44LDMzLjEtMzYuOCw0MC42LTUzLjljMS4yLTIuOSwxLjQtNS45LDAuNy04LjdjLTAuMy0yLjctMS40LTUuNC0zLjMtNy42ICAgIGMtNzMuMi04Mi43LTY5LjQtMjA4LjcsOC44LTI4Ni45YzgxLjctODEuNywyMTQuNi04MS43LDI5Ni4yLDBDNDY2LjE4MSwxNzAuMSw0NjYuMTgxLDMwMi45LDM4NC40ODEsMzg0LjZ6IiBmaWxsPSIjRkZGRkZGIi8+CgkJPGNpcmNsZSBjeD0iMjM2LjM4MSIgY3k9IjIzNi41IiByPSIxNi42IiBmaWxsPSIjRkZGRkZGIi8+CgkJPGNpcmNsZSBjeD0iMzIxLjk4MSIgY3k9IjIzNi41IiByPSIxNi42IiBmaWxsPSIjRkZGRkZGIi8+CgkJPGNpcmNsZSBjeD0iMTUwLjc4MSIgY3k9IjIzNi41IiByPSIxNi42IiBmaWxsPSIjRkZGRkZGIi8+Cgk8L2c+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==" /> ||
          <img width="24" height="24" src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTguMS4xLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDIxMi45ODIgMjEyLjk4MiIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMjEyLjk4MiAyMTIuOTgyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgd2lkdGg9IjUxMnB4IiBoZWlnaHQ9IjUxMnB4Ij4KPGcgaWQ9IkNsb3NlIj4KCTxwYXRoIHN0eWxlPSJmaWxsLXJ1bGU6ZXZlbm9kZDtjbGlwLXJ1bGU6ZXZlbm9kZDsiIGQ9Ik0xMzEuODA0LDEwNi40OTFsNzUuOTM2LTc1LjkzNmM2Ljk5LTYuOTksNi45OS0xOC4zMjMsMC0yNS4zMTIgICBjLTYuOTktNi45OS0xOC4zMjItNi45OS0yNS4zMTIsMGwtNzUuOTM3LDc1LjkzN0wzMC41NTQsNS4yNDJjLTYuOTktNi45OS0xOC4zMjItNi45OS0yNS4zMTIsMGMtNi45ODksNi45OS02Ljk4OSwxOC4zMjMsMCwyNS4zMTIgICBsNzUuOTM3LDc1LjkzNkw1LjI0MiwxODIuNDI3Yy02Ljk4OSw2Ljk5LTYuOTg5LDE4LjMyMywwLDI1LjMxMmM2Ljk5LDYuOTksMTguMzIyLDYuOTksMjUuMzEyLDBsNzUuOTM3LTc1LjkzN2w3NS45MzcsNzUuOTM3ICAgYzYuOTg5LDYuOTksMTguMzIyLDYuOTksMjUuMzEyLDBjNi45OS02Ljk5LDYuOTktMTguMzIyLDAtMjUuMzEyTDEzMS44MDQsMTA2LjQ5MXoiIGZpbGw9IiMwMDZERjAiLz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K" />
        }
        {this.state.unreadCount > 0 && <span class="info">{this.state.unreadCount}</span>}
      </button>
    ];
  }
}

ReactDOM.render(
  <ChatBox address="wss://mc.penzur.xyz/ws"/>,
  document.getElementById("user-activities")
);
