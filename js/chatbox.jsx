function Spinner() {
    return <div class="spinner">loading...</div>;
}

function Logs(props) {
  if (props.logs.length === 0) {
    return <center><small>No Activities Yet.</small></center>;
  }

  return <ul>
    {
      props.logs.map((log) => <li>
        <span class="time">{log.time}</span>
        <span class="message">{log.message}</span>
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

  componentWillMount() {
    const ws = new WebSocket(this.state.address);
    ws.onmessage = (m) => {
      if (m.data.match(/welcome/i)) return;

      const log = {
        time: m.data.match(/\d+:\d+:\d+/i)[0],
        message: m.data.replace(/\[.+\]: /i, '').replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '')
      };

      const logs = [log, ...this.state.logs]

      let unreadCount = this.state.unreadCount;
      if (this.state.collapsed) {
        unreadCount += 1;
      }

      this.setState(Object.assign({}, this.state, {
        logs,
        unreadCount
      }));
    };
    ws.onopen = () => {
      if (ws.readyState === 1) {
        this.setState(Object.assign({}, this.state, { loading:false }));
      }
    }
    ws.onclose = console.log;
  }

  toggle() {
    let c = this.state.unreadCount;
    if (this.state.collapsed) c = 0;
    this.setState(Object.assign({}, this.state, {
      collapsed: !this.state.collapsed,
      unreadCount: c
    }));
  }

  render() {
    return <div class={this.state.collapsed ? 'collapsed' : ''}>
      <header>
        <h4>Activities</h4>
        <button class="toggle" onClick={this.toggle.bind(this)}>&nbsp;</button>
        {this.state.unreadCount > 0 && <span class="info">{this.state.unreadCount}</span>}
      </header>
      <div class="list">
        {(this.state.loading && <Spinner/>) || <Logs logs={this.state.logs}/>}
      </div>
    </div>;
  }
}

ReactDOM.render(
  <ChatBox address="wss://mc.penzur.xyz/ws"/>,
  document.getElementById("chatbox")
);
