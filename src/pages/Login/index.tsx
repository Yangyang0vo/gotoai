import { useEffect, useState } from 'react'
import './index.css'
import { Button, Checkbox, ConfigProvider, Form, type FormProps, Input } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import Loading from '@/components/loading'
import { useLocation, useNavigate } from 'react-router-dom'
import logo from '@/assets/images/logo.png'
import Toast from '@/components/Toast'
import { login } from '@/store/action/loginActions'
import { useAppDispatch } from '@/store/hooks'
import { getAccountInfo, hasAccountInfo, removeAccountInfo, removeAccountPassword, setAccountInfo, setDifyInfo } from '@/utils/storage'
import { getAppInfo } from '@/api/login'
import { getUserProfile } from '@/store/action/profileActions'
type FieldType = {
  username?: string
  password?: string
  remember?: string
}

export default function Login() {
  // 定义一个loading状态
  const [loading, setLoading] = useState(false)
  // 使用navigate
  const navigate = useNavigate()
  // 使用Form
  const [form] = Form.useForm()
  // 使用location
  const location = useLocation()
  // 使用dispatch
  const dispatch = useAppDispatch()
  // 定义onFinish函数
  const onFinish: FormProps<FieldType>['onFinish'] = async ({ username, password, remember }) => {
    // 如果用户名或密码为空，则返回
    if (!username || !password) return
    // 设置loading为true
    setLoading(true)
    // 发起登录请求
    const res = await dispatch(
      login({
        name: username,
        password,
        type: 1
      })
    )
    // 设置loading为false
    setLoading(false)
    // 如果请求失败，则返回
    if (!res.payload) return
    if (res.meta.requestStatus === 'rejected') return
    // 如果记住密码，则保存用户名和密码
    if (remember) {
      setAccountInfo({
        username: username,
        password: password
      })
    } else {
      // 否则只保存帐号
      setAccountInfo({
        username: username
      })
      // removeAccountPassword()
    }
    // 获取Dify 配置
    // const resp = await getAppInfo()
    // if (!resp) return Toast.notify({ type: 'error', message: '获取知识库配置失败' })
    // // 保存Dify 配置
    // setDifyInfo(resp.data)
    // 提示登录成功
    Toast.notify({
      type: 'success',
      message: '登陆成功'
    })
    // 如果location有state，则跳转到from
    if (location.state) {
      const { from } = location.state
      return navigate(from)
    }
    // 否则跳转到首页
    navigate('/')
  }

  // 定义onFinishFailed函数
  const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (err) => {
    console.log('Failed:', err)
  }
  // 定义restPassword函数
  // const restPassword = () => {
  //   console.log('goto rest')
  //   Toast.notify({
  //     type: 'info',
  //     message: '请与管理员联系'
  //   })
  // }

  // 使用了React的useEffect钩子，当组件挂载时，会执行下面的代码
  useEffect(() => {
    // 如果用户信息存在
    if (hasAccountInfo()) {
      // 获取用户信息
      const userInfo = getAccountInfo()
      // 将用户信息设置到表单中
      form.setFieldsValue(userInfo)
    }
  }, [form])

  return (
    <ConfigProvider
      theme={{
        components: {
          Form: {},
          Input: {
            // activeBorderColor: '',
            hoverBorderColor: ''
          },
          Button: {
            // defaultHoverBorderColor: '',
            // defaultHoverColor: '',
            // defaultHoverBg: '',
            // defaultActiveColor: '',
            // defaultActiveBorderColor: '',
            // defaultBg: '#008997'
          }
        }
      }}
    >
      <div className="login">
        {loading && <div id="mask" className="w-full h-full opacity-30" style={{ position: 'absolute', zIndex: 999, backgroundColor: '#fff' }}></div>}
        {loading && <Loading></Loading>}
        <div className="my_container right-panel-active">
          {/* Sign In */}
          <div className="container__form container--signin">
            <Form form={form} className="form" id="form2" initialValues={{ remember: true }} onFinish={onFinish} onFinishFailed={onFinishFailed} autoComplete="off">
              <div className="logo w-28">
                <img src={logo} alt="" />
              </div>
              <h2 className="form__title text-lg text-slate-500 mb-0">OneAsk 企业一站式AI应用平台</h2>
              <p className="text-slate-500 mb-3 "> Version 2.1.0</p>
              <Form.Item<FieldType> labelAlign="left" name="username" rules={[{ required: true, message: '请输入用户名!' }]}>
                <Input
                  style={{
                    padding: '10px'
                  }}
                  prefix={<UserOutlined className="site-form-item-icon" />}
                  placeholder="User"
                />
              </Form.Item>

              <Form.Item<FieldType> labelAlign="left" name="password" rules={[{ required: true, message: '请输入密码！' }]} style={{ marginBottom: 0 }}>
                <Input.Password
                  style={{
                    padding: '10px'
                  }}
                  prefix={<i className="iconfont icon-mima"></i>}
                  placeholder="Password"
                  autoComplete="off"
                />
              </Form.Item>

              <Form.Item<FieldType> name="remember" valuePropName="checked" style={{ margin: 10 }}>
                <Checkbox>记住密码</Checkbox>
              </Form.Item>

              {/* <span className="link" onClick={() => restPassword()}>
                忘记密码?
              </span> */}

              <Form.Item>
                <Button disabled={loading} className="btn" htmlType="submit">
                  Sign In
                </Button>
              </Form.Item>
            </Form>
          </div>

          {/* Overlay */}
          <div className="container__overlay">
            <div className="overlay"></div>
          </div>
        </div>

        <div className="copyright">
          <ul className=" mb-3">
            <li>
              <a target="_blank" rel="noopener noreferrer" href="https://www.gotoai.world/h-col-128.html">
                联系我们
              </a>
            </li>
            <li>
              <a target="_blank" rel="noopener noreferrer" href="https://www.gotoai.world/h-col-148.html">
                产品矩阵
              </a>
            </li>
            <li>
              <a target="_blank" rel="noopener noreferrer" href="https://www.gotoai.world/h-col-126.html">
                关于我们
              </a>
            </li>
          </ul>
          <p>©2020 深圳市云展信息技术有限公司 粤ICP备15077337号 热线：400-862-1600</p>
        </div>
      </div>
    </ConfigProvider>
  )
}
