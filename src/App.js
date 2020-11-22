import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import { isU8a, u8aToString } from '@polkadot/util';
import { Modal, Button, Input, Select, Layout, Menu, Avatar, Row, Col, Card, List, Comment, notification } from 'antd';
import { UserOutlined, CommentOutlined, SendOutlined, PlusOutlined } from '@ant-design/icons';
//import InfiniteScroll from 'react-infinite-scroller';
import keyring from '@polkadot/ui-keyring';
import React from 'react';
import logo from './logo.svg';
import './App.css';

const { Header, Footer, Sider, Content } = Layout;
const { Search } = Input;
const { Option } = Select;
var wsProvider;// = new WsProvider("127.0.0.1");;
//let t=await ApiPromise.create({ provider: wsProvider }).isReady;

const ColorList = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae'];

function Random(list) {
  let len = list.length;
  let i = Math.floor(Math.random() * len);
  return list[i];
}

class Connector extends React.Component {

  state = {
    value: "",
    loading: false,
    visible: this.props.visible,
  };

  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  sendIP = (value, Event) => {
    //console.log(value);
    this.setState({ loading: true });
    this.props.parent.ReceiveIP(value);
    //console.log(this.value);
    //console.log(res);
    //this.setState({ visible: !res, loading: false });
  };

  handleOk = () => {
    this.setState({ loading: true });
    setTimeout(() => {
      this.setState({ loading: false, visible: false });
    }, 3000);
  };

  handleCancel = () => {
    this.setState({ visible: false });
  };

  static getDerivedStateFromProps(props, state) {
    if (props.visible !== state.visible) {
      return {
        visible: props.visible,
      };
    }
    return null;
  };


  render() {
    return (
      <>
        <Modal
          visible={this.state.visible}
          title="Connect to Substrate node"
          onOk={this.handleOk}
          footer={[]}
          closable={false}
          centered
          destroyOnClose={true}
        >
          <Search placeholder="input node address" enterButton="Connect" size="large" loading={this.state.loading} onSearch={this.sendIP} />
        </Modal>
      </>
    );
  }
}

class Selector extends React.Component {

  state = {
    init: false,
    value: "",
    visible: this.props.visible,
    loading: false,
    //api: this.props.api,
    //keyring: new Keyring({ type: 'sr25519' }),
    accounts: [],
  };


  handleOk = () => {
    this.setState({ loading: true });
    let value = this.state.value;
    let accounts = this.state.accounts;
    for (let i = 0; i < accounts.length; i++) {
      if (accounts[i].address === value) {
        value = accounts[i];
        break;
      }
    }
    this.props.parent.SetAccount(value);
  };

  getAccount = async () => {
    try {
      await web3Enable('substrate-front-end-tutorial');  //

      let accounts = await web3Accounts();
      accounts = accounts.map((address, meta) =>
        ({ address, meta: { ...meta, name: `${meta.name} (${meta.source})` } })
      );

      keyring.loadAll({ isDevelopment: true }, accounts);

      //console.log(keyring.getAccounts());
      this.setState({ accounts: keyring.getAccounts() });
      console.log(this.state.accounts);
    } catch (e) {
      console.error('Account get error');
      console.error(e);
    }
  };

  componentDidUpdate() {
    //console.log("DidUpdate");
    //let keys = this.state.keyring.getPairs();
    //console.log(keys);
    if (this.props.visible && !this.state.init && (keyring.getAccounts().length > 0)) {
      this.setState({ init: true, accounts: keyring.getAccounts() });
    }
    else if (this.props.visible && !this.state.init) {
      this.setState({ init: true });
      this.getAccount();
    }

  };

  static getDerivedStateFromProps(props, state) {
    if (props.visible !== state.visible) {
      return {
        visible: props.visible,
        loading: false,
      };
    }
    return null;
  };

  onChange = (value) => {
    this.setState({ value: value });
    //console.log(`Change value: ${value}`);
  };

  render() {

    let accounts = this.state.accounts;

    return (
      <Modal
        visible={this.state.visible}
        title="Select Account"
        onOk={this.handleOk}
        footer={[
          <Button key="submit" type="primary" loading={this.state.loading} onClick={this.handleOk}>
            Submit
          </Button>,
        ]}
        closable={false}
        centered
      >
        <Select
          style={{ width: 400 }}
          placeholder="Select a Account"
          //optionFilterProp="children"
          onChange={this.onChange}
        /*
        filterOption={(input, option) =>
          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }*/
        >
          {accounts.map(item => { return (<Option value={item.address} key={item.address}>{item.meta.name}</Option>); })}
        </Select>
      </Modal>
    );
  }
}

class NewUser extends React.Component {
  state = {
    visible: this.props.visible,
    loading: false,
    value: "",
    api: this.props.api,
    addr: this.props.addr,
  };

  handleOk = async () => {
    this.setState({ loading: true });

    //console.log(this.state.addr);
    let addr = this.state.addr;
    let res = this.state.api.tx.templateModule.newUser(this.state.value);
    //console.log(keyring.getPair(addr));
    res.signAndSend(keyring.getPair(addr), ({ event = [], status }) => { if (status.isFinalized) this.props.parent.getUser(); }).catch(this.props.parent.txErrHandler);
    //
    //this.setState({ visible: false });


  };

  onChange = (event) => {
    let val = event.target.value;
    //console.log(event.target);
    this.setState({ value: val });
  };

  static getDerivedStateFromProps(props, state) {
    if (props.visible !== state.visible) {
      //console.log(props);
      return {
        visible: props.visible,
        api: props.api,
        addr: props.addr,
        loading: false,
      };
    }
    return null;
  };

  render() {
    return (
      <Modal
        visible={this.state.visible}
        title="New User" onOk={this.handleOk}
        footer={[
          <Button key="submit" type="primary" loading={this.state.loading} onClick={this.handleOk}>Submit</Button>,
        ]}
        closable={false}
        centered
      >
        <Input placeholder="Name" onChange={this.onChange}></Input>
      </Modal>
    );
  }
}

class Join extends React.Component {
  state = {
    visible: this.props.visible,
    loading: false,
    value: 0,
    api: this.props.api,
    addr: this.props.addr,
  };

  handleOk = async () => {
    let val = this.state.value;
    if (val > 255 || val < 1) return;
    this.setState({ loading: true });

    let addr = this.state.addr;
    let res = this.state.api.tx.templateModule.joinRoom(this.state.value);
    //console.log(keyring.getPair(addr));
    res.signAndSend(keyring.getPair(addr), ({ event = [], status }) => { if (status.isFinalized) console.log("Join over"); }).catch(this.props.parent.txErrHandler);
  };

  onChange = (event) => {
    let val = event.target.value;
    val = parseInt(val);
    if (val > 255 || val < 0) return;
    //val = (val & 0x000000ff) >> 8;
    //console.log(val);
    this.setState({ value: val });
  };

  static getDerivedStateFromProps(props, state) {
    if (props.visible !== state.visible) {
      return {
        visible: props.visible,
        api: props.api,
        addr: props.addr,
        loading: false,
      };
    }
    return null;
  };

  render() {
    return (
      <Modal
        visible={this.state.visible}
        title="Join" onOk={this.handleOk}
        footer={[
          <Button key="submit" type="primary" loading={this.state.loading} onClick={this.handleOk}>Submit</Button>,
        ]}
        closable={false}
        centered
      >
        <Input placeholder="Room id(0-255)" onChange={this.onChange} maxLength={3}></Input>
      </Modal>
    );
  }
}

class App extends React.Component {

  //const [connector, setConnector] = useState(true);
  //const [api, setApi] = useState();
  state = {
    connector: true,
    selector: false,
    api: "",
    account: "",
    newUser: false,
    join: false,
    name: "",
    input: "",
    current: -1,
    rooms: [],
    messages: [],
    events: false,
    sendLoad: false,
  };


  ReceiveIP = async (ip) => {
    wsProvider = new WsProvider("ws://" + ip);
    //console.log("ws");
    //let api = await ApiPromise.create({ provider: wsProvider })
    let res = false;
    let api = new ApiPromise({ provider: wsProvider });
    api.on('connected', function () {
      console.log("connected");
      res = true;
    }).on('disconnected', function () {
      console.log("disconnected");
      res = false;
    }).on('error', function () {
      console.log("error");
    });


    //console.log(api);
    await api.isReady;
    this.setState({ api: api, connector: !res });
    this.setState({ selector: res });
    //console.log(api.genesisHash.toHex());
    //console.log(this.state);
    //console.log("Connected");
    return res;
  };


  SetAccount = (value) => {
    if (value == null) return;

    //console.log(value);
    this.setState({ selector: false, account: value }, this.getUser);
    //console.log(this.state);
    //console.log(keyring.getPair(value.address));

  };

  txResHandler = ({ status }) => {
    if (status.isFinalized) {
      console.log(`Finalized. Block hash: ${status.asFinalized.toString()}`);
    } else {
      console.log(`Current transaction status: ${status.type}`);
    }
  };

  txErrHandler = err => console.log(`Transaction Failed: ${err.toString()}`);

  getUser = async () => {

    this.setState({ newUser: false });
    let api = this.state.api;
    api.on("error", function (e) {
      console.log(e);
    });

    let addr = this.state.account.address;
    //console.log(this.state);
    //let api = await ApiPromise.create();
    let res = await api.query.templateModule.accountInfo(addr);
    //console.log(typeof (res));
    //console.log(res);
    if (res == null || res[0].length < 1) {

      //console.log(res[0]);
      /*
      if (isU8a(res[0])) {
        console.log("is u8");
        res = u8aToString(res[0]);
      }*/
      console.log("new user");
      this.setState({ newUser: true });
      return;
    }
    if (isU8a(res[0])) {
      res = u8aToString(res[0]);
    }
    console.log(res);
    this.setState({ name: res });

    res = await api.query.templateModule.accountJoin(addr);
    let rooms = [];
    for (let i = 0; i < res.length; i++) {
      rooms.push(res[i]);
    }
    this.setState({ rooms: rooms });


    if (!this.state.events) {
      this.setState({ events: true });
      api.query.system.events(events => {
        events.forEach(element => { //ie not compatible
          let { event, phase } = element;
          let types = event.typeDef;
          let eventName = `${event.section}:${event.method}:: (phase=${phase.toString()})`;
          let params = event.data.map((data, index) => `${types[index].type}: ${data.toString()}`);
          if (eventName.includes("templateModule:UserJoin:: (phase={\"ApplyExtrinsic\":1})")) {
            this.setState({ join: false });
            this.getUser();
          }
          else if (eventName.includes("templateModule:SendOK:")) {
            notification.open({ message: 'Transaction', description: 'Send Success' });
          }
          console.log(`${eventName} : ${event.meta.documentation.join(', ').toString()} : ${params.join(', ')}`);

        });
      })
    }

    /*
    //Get all api
    let pallets=Object.keys(api.tx);
    console.log(pallets);
    */
  };

  addClick = (event) => {
    this.setState({ join: true });
  };

  send = () => {
    if (this.state.current < 0 || this.state.sendLoad) return;
    this.setState({ sendLoad: true });
    let res = this.state.api.tx.templateModule.sendMessage(this.state.current, this.state.input, Math.floor(Math.random() * 10));
    //console.log(keyring.getPair(addr));
    res.signAndSend(keyring.getPair(this.state.account.address), ({ event = [], status }) => { if (status.isFinalized) { this.setState({ sendLoad: false }); this.updateMessage(this.state.current); } }).catch(this.txErrHandler);
  };

  updateMessage = async (id) => {
    let res = await this.state.api.query.templateModule.messages(id);
    let items = [];
    for (let i = 0; i < res.length; i++) {
      let item = [];
      item.push(res[i][0].toString());
      item.push(u8aToString(res[i][1]));
      item.push(u8aToString(res[i][2]));
      item.push(Date(res[i][3].toNumber()).toLocaleString());
      items.push(item);
    }
    console.log(items);
    this.setState({ messages: items });
  };

  menuClick = async ({ item, key, keyPath, domEvent }) => {
    //console.log(key);
    if (key > 255 || key < 0) return;
    this.setState({ current: key });
    this.updateMessage(key);
  };


  inputChang = (event) => {
    let val = event.target.value;
    this.setState({ input: val });
  };

  render() {
    return (

      <Layout className="App">
        <Sider className="Info">
          <Row justify="center" align="middle" style={{ marginTop: "10%", marginBottom: "10%" }}>
            <Col span="1"></Col>
            <Col span="10">
              <Avatar style={{ backgroundColor: Random(ColorList), verticalAlign: 'middle' }} size={{ xs: 24, sm: 32, md: 40, lg: 64, xl: 80 }}>
                {this.state.name}
              </Avatar>
            </Col>
            <Col span="1"></Col>
          </Row>
          <Row style={{ height: "68%" }}>
            <Menu theme="dark" mode="inline" onClick={this.menuClick} >
              {this.state.rooms.map(item => { return (<Menu.Item key={item} icon={<CommentOutlined />}>{item}</Menu.Item>); })}
            </Menu>
          </Row>
          <Row align="middle" justify="center">
            <Col><Button className="shadow" shape={"circle"} style={{ border: "none" }} icon={<PlusOutlined />} size={"large"} onClick={this.addClick}></Button></Col>
          </Row>
        </Sider>
        <Layout >
          <Header></Header>
          <Content >
            <div style={{ height: "100%", overflow: "auto" }}>

              <List size={"large"} align="middle" dataSource={this.state.messages} renderItem={item => (
                <Comment
                  className="shadow radius-small"
                  author={item[1]}
                  avatar={<UserOutlined />}
                  content={item[2]}
                  datetime={item[3]}
                  style={{ width: "80%", backgroundColor: "#fff", marginTop: "1%", marginBottom: "1%", paddingLeft: "2%", paddingRight: "2%", border: "none" }}
                >
                </Comment>)}>
              </List>
            </div>
          </Content>
          <Footer>
            <Card className="shadow radius" style={{ height: "100%" }} bodyStyle={{ backgroundImage: "radial-gradient(rgba(240,255,255,0.5),rgba(240,255,255,0))" }}>
              <Row align="middle" style={{ height: "100%" }}>
                <Col span="20"><Input.TextArea bordered={false} maxLength={100} placeholder="Input" onChange={this.inputChang} style={{ resize: "none" }}></Input.TextArea></Col>

                <Col span="4"><Button style={{ width: "100%", height: "100", border: "none", boxShadow: "0 0 0 0" }} icon={<SendOutlined />} size={"large"} onClick={this.send} loading={this.state.sendLoad}></Button></Col>
              </Row>
            </Card>
          </Footer>
        </Layout>

        <Connector visible={this.state.connector} parent={this}></Connector>
        <Selector visible={this.state.selector} parent={this}></Selector>
        <NewUser visible={this.state.newUser} api={this.state.api} addr={this.state.account.address} parent={this}></NewUser>
        <Join visible={this.state.join} api={this.state.api} addr={this.state.account.address} parent={this}></Join>
      </Layout >

    );
  }
}

export default App;
