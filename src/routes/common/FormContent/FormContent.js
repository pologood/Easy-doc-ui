import React from 'react';
import PropTypes from 'prop-types';
import {Form, Row, Col, Input, Button, Modal} from 'antd';
import { getDefault } from '../../util/util';
import { getRes, base } from '../../../config.js';

const FormItem = Form.Item;
const { TextArea } = Input;
class FormContent extends React.Component {
    static propTypes = {
        formData: PropTypes.array.isRequired, // 表单数据
        body: PropTypes.object, // body
        path: PropTypes.string.isRequired, // 目标路径
        type: PropTypes.string.isRequired // 方法类型
    }

    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            res: {}
        }
    }
    showModal = () => {
        this.setState({
          visible: true,
        });
      }
    
    handleOk = (e) => {
        console.log(e);
        this.setState({
          visible: false,
        });
      }
    
    handleCancel = (e) => {
        console.log(e);
        this.setState({
          visible: false,
        });
      }
    
    defaultValue(body) {
        if(body === null) {
          return '{\n "key" : "value" \n}';
        }
        const { fieldList } = body;
        var obj = {};
        fieldList && fieldList.forEach(item => obj[item.name] = getDefault(item.defaultValue, item.type));
        return JSON.stringify(obj).replace(/,/g,',\n').replace(/^{/g, '{\n').replace(/}$/g, '\n}');
    }

    async handleSubmit(e)  {
        const {type, path} = this.props;
        e.preventDefault();
        var body = {};
        var param = '';
        var url = '';
         this.props.form.validateFields((err, values) => {
          if (!err) {   
            Object.keys(values).forEach(item => {
                if(/^{\(.|\n\)*}$/g.test(values[item])) {
                    body = JSON.parse(values[item]);
                } else {
                    param += `${item}=${values[item]}&`;
                }
            })
            url  = base + path + '?' + param.substring(0, param.length-1);
          }
        });
        const res =  await getRes(url, type, JSON.stringify(body));
        console.log('res', res, url, body);
        this.setState({ res: res });
    }

    render() {
        const {formData, body} = this.props;
        const {getFieldDecorator} = this.props.form;
        return (
            <Form onSubmit={this.handleSubmit.bind(this)}>
            {formData && formData.map((item, index)=> (
                <Row key={`row-${index}`} className="subPanelDetail" type="flex"  align="top">
                <Col span={12}>
                    <span>{item.name}</span>
                    <span v-if={item.required.toString()} className="required"> *required</span>
                    <div className="paramType">{item.type}</div>
                </Col>
                <Col span={8}>
                    <p>{item.description}</p>                 
                    {item.type === 'Object' ? (
                      <FormItem>
                      {getFieldDecorator(item.name, {
                      initialValue: this.defaultValue(body)
                      })(
                      <TextArea  rows={4} />
                      )}
                      </FormItem>
                    ) : (
                      <FormItem>
                      {getFieldDecorator(item.name, {
                      initialValue: item.defaultValue
                      })(
                      <Input size="large" />
                      )}
                      </FormItem>
                    )}
                    </Col>
              </Row>
          ))}
          <FormItem>
              <Button type="primary" className="excute"  htmlType="submit" block onClick={this.showModal}>运行</Button>
          </FormItem>
          <Modal
            title="Basic Modal"
            visible={this.state.visible}
            onOk={this.handleOk}
            onCancel={this.handleCancel}
            >
            <TextArea disabled  rows={6} value={JSON.stringify(this.state.res).replace(/,/g,',\n').replace(/^{/g, '{\n').replace(/}$/g, '\n}')}/>
        </Modal>
        </Form>)
    }
}

export default Form.create()(FormContent);