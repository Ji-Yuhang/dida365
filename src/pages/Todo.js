import React, { Component, PureComponent } from 'react';
import { formatMessage } from 'umi/locale';
import { Layout, message, Input, Checkbox, Row, Col } from 'antd';
import Animate from 'rc-animate';
import { connect } from 'dva';
import router from 'umi/router';
import GlobalHeader from '@/components/GlobalHeader';
import TopNavHeader from '@/components/TopNavHeader';
// import styles from './Header.less';
import _ from 'lodash'
import { batchSaveTodoList, createTodo, getTodoList } from '@/services/todo';

const { Header } = Layout;
class TodoView extends PureComponent{
  onCheckBoxChanged = (e)=>{
    const {todo, onCheckBoxChanged} = this.props;
    const checked = e.target.checked;

    e.preventDefault();
    e.stopPropagation();
    onCheckBoxChanged(todo, checked);

    return false;
  };
  render(){
    const {todo, onCheckBoxChanged} = this.props;
    // justifyContent: "center"/*水平居中*/

    return (
      <li className={'task'} id={todo.id}>
        {/*<Row>*/}
          {/*<Col>*/}
          <div className="l-task" style={{
            boxShadow: 'transparent 0.2em 0px 0px inset',
            height: '2em',
            borderBottom: 'solid 1px rgba(0, 0, 0, 0.25)',
            display:"flex",
            alignItems:"center",/*垂直居中*/
          }}>
            <Checkbox onChange={this.onCheckBoxChanged} checked={todo.checked} />

            {todo.text}
          </div>
          {/*</Col>*/}
        {/*</Row>*/}

      </li>
    );
  }
};
class TodoList extends Component {
  state = {
    visible: true,
    todos: [],
    inputText: '',
  };

  static getDerivedStateFromProps(props, state) {
    if (!props.autoHideHeader && !state.visible) {
      return {
        visible: true,
      };
    }
    return null;
  }

  componentDidMount() {
    document.addEventListener('scroll', this.handScroll, { passive: true });
    getTodoList()
      .then((data) => {
        console.info(data);

        // const todos = JSON.parse(data);
        this.setState({todos: data})
      })
      .catch((err)=>{
        console.error(err);
      })
  }

  componentWillUnmount() {
    document.removeEventListener('scroll', this.handScroll);
  }

  getHeadWidth = () => {
    const { isMobile, collapsed, setting } = this.props;
    const { fixedHeader, layout } = setting;
    if (isMobile || !fixedHeader || layout === 'topmenu') {
      return '100%';
    }
    return collapsed ? 'calc(100% - 80px)' : 'calc(100% - 256px)';
  };

  handleNoticeClear = type => {
    message.success(
      `${formatMessage({ id: 'component.noticeIcon.cleared' })} ${formatMessage({
        id: `component.globalHeader.${type}`,
      })}`
    );
    const { dispatch } = this.props;
    dispatch({
      type: 'global/clearNotices',
      payload: type,
    });
  };

  handleMenuClick = ({ key }) => {
    const { dispatch } = this.props;
    if (key === 'userCenter') {
      router.push('/account/center');
      return;
    }
    if (key === 'triggerError') {
      router.push('/exception/trigger');
      return;
    }
    if (key === 'userinfo') {
      router.push('/account/settings/base');
      return;
    }
    if (key === 'logout') {
      dispatch({
        type: 'login/logout',
      });
    }
  };

  handleNoticeVisibleChange = visible => {
    if (visible) {
      const { dispatch } = this.props;
      dispatch({
        type: 'global/fetchNotices',
      });
    }
  };

  handScroll = () => {
    const { autoHideHeader } = this.props;
    const { visible } = this.state;
    if (!autoHideHeader) {
      return;
    }
    const scrollTop = document.body.scrollTop + document.documentElement.scrollTop;
    if (!this.ticking) {
      this.ticking = true;
      requestAnimationFrame(() => {
        if (this.oldScrollTop > scrollTop) {
          this.setState({
            visible: true,
          });
        } else if (scrollTop > 300 && visible) {
          this.setState({
            visible: false,
          });
        } else if (scrollTop < 300 && !visible) {
          this.setState({
            visible: true,
          });
        }
        this.oldScrollTop = scrollTop;
        this.ticking = false;
      });
    }
  };

  render_old() {
    const { isMobile, handleMenuCollapse, setting } = this.props;
    const { navTheme, layout, fixedHeader } = setting;
    const { visible } = this.state;
    const isTop = layout === 'topmenu';
    const width = this.getHeadWidth();
    const HeaderDom = visible ? (
      <Header style={{ padding: 0, width }} className={fixedHeader ? styles.fixedHeader : ''}>
        {isTop && !isMobile ? (
          <TopNavHeader
            theme={navTheme}
            mode="horizontal"
            onCollapse={handleMenuCollapse}
            onNoticeClear={this.handleNoticeClear}
            onMenuClick={this.handleMenuClick}
            onNoticeVisibleChange={this.handleNoticeVisibleChange}
            {...this.props}
          />
        ) : (
          <GlobalHeader
            onCollapse={handleMenuCollapse}
            onNoticeClear={this.handleNoticeClear}
            onMenuClick={this.handleMenuClick}
            onNoticeVisibleChange={this.handleNoticeVisibleChange}
            {...this.props}
          />
        )}
      </Header>
    ) : null;
    return (
      <Animate component="" transitionName="fade">
        {HeaderDom}
      </Animate>
    );
  };

  handTextChange = (e) => {
    const { autoHideHeader } = this.props;
    const { visible } = this.state;
    const text = e.target.value;
    // console.log('handTextChange', e, e.target, e.target.value)
    this.setState({
      inputText: text,
    })
  };

  onPressEnter = (e) => {
    const text = e.target.value;
    console.log("onPressEnter", text);
    const {todos} = this.state;

    createTodo(text)
      .then((value) => {
        console.info(value);
        this.setState({todos:value,  inputText: ''})
      })
      .catch((err)=>{
        console.error(err);
      })

    // const mergedTodos = _.concat(todos, [{text: text, id: _.uniqueId(), checked: false}])
    // console.log(mergedTodos)

    // this.setState({
    //   todos: mergedTodos,
    //   inputText: '',
    // }, ()=>this.saveStateToServer())
  };

  saveStateToServer = () => {
    const {todos} = this.state;
    batchSaveTodoList(todos)
      .then((value) => {
        console.info(value);
      })
      .catch((err)=>{
        console.error(err);
      })

    console.log('after setState', todos)
  };

  onCheckBoxChanged = (todo, checked)=>{
    // const checked = e.target.checked;
    // e.preventDefault();
    console.log("onCheckBoxChanged", checked, todo);
    let {todos} = this.state;
    let obj = _.filter(todos, (obj)=> obj.id == todo.id)[0];
    obj.checked = checked;
    this.setState({
      todos
    }, ()=>this.saveStateToServer())
  };


  renderTodoList (){
    const {todos} = this.state;
    const html =  _.filter(todos, (obj)=>!obj.checked).map((todo) => {
      return (
        <TodoView id={todo.id} todo={todo} onCheckBoxChanged={this.onCheckBoxChanged} />
      )

    });
    return (
      <ul className={"taskList"}>
        {html}

      </ul>
    )

  };


  renderCompletedTodoList (){
    const {todos} = this.state;
    const html = _.filter(todos, (obj)=>obj.checked).map((todo) => {
      return (
        <TodoView id={todo.id} todo={todo} onCheckBoxChanged={this.onCheckBoxChanged} />
      )
    });
    return (
      <ul className={"taskList"}>
        {html}
      </ul>
    )

  };
  render() {
    return (
      <div>
        <Input onChange={this.handTextChange} value={this.state.inputText} onPressEnter={this.onPressEnter} placeholder="添加任务至收件箱，回车即可保存" />
        <p>TodoList</p>
        {
          this.renderTodoList()
        }
        已完成
        {
          this.renderCompletedTodoList()
        }
      </div>
    )
  }
}

export default connect(({ user, global, setting, loading }) => ({
  currentUser: user.currentUser,
  collapsed: global.collapsed,
  fetchingNotices: loading.effects['global/fetchNotices'],
  notices: global.notices,
  setting,
}))(TodoList);
