<template>

    <div>
        <!--OpcServer Card-->
        <div class="jumbotron">
            <Row :gutter="16" style="height: 380px;">
                <i-col span="8" offset="3">
                    <h1 style="color: aliceblue; font-size: 40px; margin-top: 24px">OPC Server</h1>
                    <i-circle :percent="100"  style="margin-top: 30px;" stroke-color="#5cb85c">
                        <Icon type="ios-checkmark" size="60" style="color:#5cb85c"></Icon>
                    </i-circle>
                </i-col>
                <!--opc Server form-->
                <i-col span="8" offset="5">
                    <Form class="form-server" ref="formOpcServer" :label-width="180" :model="opcServer">
                        <FormItem class="font-size" label="Server Name" prop="progId">
                            <Select v-model="opcServer.progId" :placeholder="opcServer.progId" :disabled="cannotEditOpcServer">
                                <Option v-for="progId in progIds" :value="progId" :key="progId">{{progId}}</Option>
                            </Select>
                        </FormItem>
                        <FormItem class="font-size" label="Server IP" prop="ipAddress">
                            <Input v-model="opcServer.ipAddress" placeholder="xxx.xxx.xxx.xxx" :disabled="cannotEditOpcServer" />
                        </FormItem>
                        <FormItem class="font-size" label="Computer Domain" prop="domain">
                            <Input v-model="opcServer.domain" placeholder="Computer Domain" :disabled="cannotEditOpcServer"/>
                        </FormItem>
                        <FormItem class="font-size" label="User Account" prop="serverName">
                            <Input v-model="opcServer.serverUser" placeholder="User Account" :disabled="cannotEditOpcServer" />
                        </FormItem>
                        <FormItem class="font-size" label="User Password" prop="serverPassword">
                            <Input v-model="opcServer.serverPassword" placeholder="User Password" type="password" :disabled="cannotEditOpcServer"/>
                        </FormItem>
                        <FormItem>
                            <Button style="margin-top: 0" type="primary" icon="ios-create" @click="editOpcServer" v-if="cannotEditOpcServer">Server Edit</Button>
                            <Button type="success" icon="md-add" v-if="!cannotEditOpcServer" @click="updateOpcServer">Submit</Button>
                            <Button type="warning" style="margin-left: 16px" icon="md-exit" v-if="!cannotEditOpcServer" @click="exitOpcServerEdit">Cancel</Button>
                        </FormItem>
                    </Form>
                </i-col>
            </Row>
        </div>
        <!--connection div-->
        <div class="connectionCard">
            <Menu mode="horizontal" theme="dark" active-name="title" @on-select="handlerNewConnectionBtnSelected">
                <MenuItem name="title">
                    <Icon type="md-flash" />
                    Connection Via OPC
                </MenuItem>
                <MenuItem name="createConnection">
                    <Icon type="md-add" />
                    New Connection
                </MenuItem>
            </Menu>
            <Card shadow>
                <Row :gutter="32" justify="center" align="middle">
                    <i-col span="5" offset="1">
                        <img align="center" src="../../static/img/Connection.png"/>
                        <div style="text-align: left; margin-top: 16px">
                            <h3>Configuration With TIA-PORTAL</h3>
                            <p>Using SIEMENS Simatic NET software as OPC server, please configure with SIEMENS TIA-portal software. The connection name should be the same with the configuration.</p>
                        </div>
                    </i-col>
                    <i-col span="17">
                        <Table :columns="columns"
                               :data="connections"
                               border="true"
                               size="small"
                               align="center"
                               :loading="ajaxStatue.getConnection"
                               :sortType="sortType"
                               @on-sort-change="handlerSortChange">
                        </Table>
                    </i-col>
                </Row>
            </Card>
        </div>
        <!--opcGroup div-->
        <div class="opcGroupCard">
            <Menu mode="horizontal" theme="dark" active-name="title" @on-select="handlerNewOpcGroupBtnSelected">
                <MenuItem name="title">
                    <Icon type="md-flash" />
                    Opc Groups
                </MenuItem>
                <MenuItem name="createOpcGroup">
                    <Icon type="md-add" />
                    New Opc Group
                </MenuItem>
            </Menu>
            <Card shadow>
                <Table :columns="opcGroupColumns"
                       :data="opcGroups"
                       border="true"
                       align="center"
                       :loading="ajaxStatue.getOpcGroups">
                </Table>
            </Card>
        </div>
        <!--新建connection弹出表单-->
        <Modal v-model="isCreatedConnection"
               @on-ok="insertConnection"
               title="New Connection"
               :width="600"
               okText="Create"
               cancel-text="Cancel">
            <Form :label-width="100" :model="createConnection">
                <FormItem class="font-size-connection" label="Protocol Id">
                    <Select v-model="createConnection.protocolId" placeholder="Please select a protocol same as your OPC server">
                        <Option v-for="protocolId in protocols" :value="protocolId" :key="protocolId">{{protocolId}}</Option>
                    </Select>
                </FormItem>
                <FormItem class="font-size-connection" label="Connection Name">
                    <Input v-model="createConnection.connectionName"/>
                </FormItem>
            </Form>
        </Modal>
        <!--新建opcGroup 弹出表单-->
        <Modal v-model="isCreatedOpcGroup"
               @on-ok="insertOpcGroup"
               title="New Opc Group"
               :width="600"
               okText="Create"
               cancel-text="Cancel">
            <Form :label-width="150" :model="createOpcGroup">
                <FormItem class="font-size-connection" label="Connection Name">
                    <Select v-model="createOpcGroup.opcConnection.connectionId" placeholder="Please select a connection name">
                        <Option v-for="connection in connections" :value="connection.connectionId" :key="connection.connectionId">{{connection.connectionName}}</Option>
                    </Select>
                </FormItem>
                <FormItem class="font-size-connection" label="Group Name">
                    <Input v-model="createOpcGroup.groupName"/>
                </FormItem>
                <FormItem class="font-size-connection" label="Update Rate">
                    <InputNumber :step="100" :min="100" v-model="createOpcGroup.updateRate" :formatter="value => `${value}ms`"
                                 :parser="value => value.replace('ms', '')">
                    </InputNumber>
                </FormItem>
            </Form>
        </Modal>

    </div>



</template>

<script>
    import $ from '../../libs/utils';
    let opcServerLastTime = {
        serverId: '',
        progId: '',
        ipAddress: '',
        domain: '',
        serverUser: '',
        serverPassword: '',
    };
    export default {
        name: "Connection.vue",
        watch: {
            connections: {
                handler(newVal, oldVal) {
                    this.$emit("connectionChange");
                },
                deep: true,
            },

            //opcGroups:
            opcGroups: {
                handler(newVal, oldVal) {
                    this.$emit("opcGroupChange");
                },
                deep: true,
            }
        },
        data() {
            return{
                menuLoading: false,
                ajaxStatue: {
                    getProgIds: false,
                    getOpcServer: false,
                    updateOpcServer: false,
                    getConnection: false,
                    getProtocols: false,
                    insertConnection: false,
                    updateConnection: false,
                    deleteConnection: false,
                    insertOpcGroup: false,
                    updateOpcGroup: false,
                    deleteOpcGroup: false,
                    getOpcGroups: false
                },
                //server状态
                progIds: [],
                opcServer: {
                    serverId: '',
                    progId: '',
                    ipAddress: '',
                    domain: '',
                    serverUser: '',
                    serverPassword: ''
                },
                cannotEditOpcServer: true,

                //connection状态
                protocols: [],
                sortType: 'default',
                key: '',
                editIndex: -1,
                columns: [
                    {
                        title: 'Id',
                        width: 80,
                        key: 'connectionId'
                    },
                    {
                        title: 'Protocol Id',
                        key: 'protocolId',
                        //sortable: 'custom',
                        render: (h, {row, index}) => {
                            if (index === this.editIndex) {
                                return h(
                                    'Select',
                                    {
                                        props: {
                                            value: this.connections[index].protocolId
                                        },
                                        on: {
                                            'on-change': (val) => {
                                                this.editConnection.protocolId = val;
                                            }
                                        }
                                    },
                                    this.protocols.map( value => {
                                        return h('Option', {
                                            props: {
                                                value: value,
                                                label: value
                                            },
                                        });
                                    }));
                            }else {
                                return h('div', [row.protocolId]);
                            }
                        }
                    },
                    {
                        title: 'Connection name',
                        key: 'connectionName',
                        //sortable: 'custom',
                        render: (h, {row, index}) => {
                            if (index === this.editIndex) {
                                return h(
                                    'Input',
                                    {
                                        props: {
                                            value: row.connectionName,
                                        },
                                        on: {
                                            input: val => {
                                                this.editConnection.connectionName = val;
                                            }
                                        }
                                    });
                            }else {
                                return h('div', {
                                    props: {
                                        key: 'connectionName'
                                    }
                                }, [row.connectionName]);
                            }
                        }
                    },
                    {
                        title: 'Action',
                        render: (h, {row, index}) => {
                            if (this.editIndex === index) {
                                return [
                                    h('Button', {
                                        props: {
                                            type: 'success',
                                            icon: 'ios-checkmark-circle'
                                        },
                                        on: {
                                            click: () => {
                                                //保存数据
                                                this.connections[index].protocolId = this.editConnection.protocolId;
                                                this.connections[index].connectionName = this.editConnection.connectionName;
                                                //发起ajax请求
                                                this.updateConnection(this.connections[index]);
                                                this.editIndex = -1;
                                            }
                                        }
                                    }, 'Save'),
                                    h('Button', {
                                        props: {
                                            type: 'warning',
                                            icon: 'ios-close-circle'
                                        },
                                        style: {
                                            marginLeft: '16px'
                                        },
                                        on: {
                                            click: () => {
                                                this.editIndex = -1;
                                            }
                                        }
                                    }, 'Cancel'),
                                    h('Button', {
                                        props: {
                                            type: 'dranger',
                                            icon: 'ios-close-circle'
                                        },
                                        style: {
                                            marginLeft: '16px'
                                        },
                                        on: {
                                            click: () => {
                                                this.connections[index].deleted = 1;
                                                this.deleteConnection(this.connections[index]);
                                                this.editIndex = -1;
                                            }
                                        }
                                    }, 'Delete')
                                ];
                            }else {
                                return h('Button', {
                                    props: {
                                        type: 'primary',
                                        icon: 'md-clipboard'
                                    },
                                    on: {
                                        click: () => {
                                            this.editConnection.protocol = row.protocol;
                                            this.editConnection.connectionName = row.connectionName;
                                            this.editIndex = index;
                                        }
                                    }
                                },'Edit Opc Connection')
                            }
                        }
                    }
                ],
                connections: [],
                isCreatedConnection: false,
                createConnection: {
                    protocolId: '',
                    connectionName: '',
                    opcServerId: 1,
                    deleted: 0,
                },
                editConnection: {
                    protocolId: '',
                    connectionName: '',
                },
                //opcGroup
                opcGroupEditIndex: -1,
                opcGroupColumns: [
                    {
                        title: 'Id',
                        width: 80,
                        key: 'groupId'
                    },
                    {
                        title: 'Opc Connection Name',
                        key: 'opcConnection',
                        render: (h, {row, index}) => {
                            if (index === this.opcGroupEditIndex) {
                                return h(
                                    'Select',
                                    {
                                        props: {
                                            value: this.opcGroups[index].opcConnection.connectionId
                                        },
                                        on: {
                                            'on-change': (val) => {
                                                this.editOpcGroup.opcConnection.connectionId = val;
                                            }
                                        }
                                    },
                                    this.connections.map( connection => {
                                        return h('Option', {
                                            props: {
                                                value: connection.connectionId,
                                                label: connection.connectionName
                                            },
                                        });
                                    }));
                            }else {
                                return h('div', [row.opcConnection.connectionName]);
                            }
                        }
                    },
                    {
                        title: 'Group name',
                        key: 'groupName',
                        render: (h, {row, index}) => {
                            if (index === this.opcGroupEditIndex) {
                                return h(
                                    'Input',
                                    {
                                        props: {
                                            value: row.groupName,
                                        },
                                        on: {
                                            input: val => {
                                                this.editOpcGroup.groupName = val;
                                            }
                                        }
                                    });
                            }else {
                                return h('div', [row.groupName]);
                            }
                        }
                    },
                    {
                        title: 'Update Rate',
                        key: 'updateRate',
                        render: (h, {row, index}) => {
                            if (index === this.opcGroupEditIndex) {
                                return h(
                                    'InInputNumber',
                                    {
                                        props: {
                                            value: row.updateRate,
                                        },
                                        on: {
                                            input: val => {
                                                this.editOpcGroup.updateRate = val;
                                            }
                                        }
                                    });
                            }else {
                                return h('div', [row.updateRate]);
                            }
                        }
                    },
                    {
                        title: 'Action',
                        render: (h, {row, index}) => {
                            if (this.opcGroupEditIndex === index) {
                                return [
                                    h('Button', {
                                        props: {
                                            type: 'success',
                                            icon: 'ios-checkmark-circle'
                                        },
                                        on: {
                                            click: () => {
                                                //保存数据
                                                this.opcGroups[index].opcConnection.connectionId = this.editOpcGroup.opcConnection.connectionId;
                                                this.opcGroups[index].opcConnection.connectionName = this.editOpcGroup.opcConnection.connectionName;
                                                this.opcGroups[index].groupName = this.editOpcGroup.groupName;
                                                this.opcGroups[index].updateRate = this.editOpcGroup.updateRate;
                                                //发起ajax请求
                                                this.updateOpcGroup(this.opcGroups[index]);
                                                this.opcGroupEditIndex = -1;
                                            }
                                        }
                                    }, 'Save'),
                                    h('Button', {
                                        props: {
                                            type: 'warning',
                                            icon: 'ios-close-circle'
                                        },
                                        style: {
                                            marginLeft: '16px'
                                        },
                                        on: {
                                            click: () => {
                                                this.opcGroupEditIndex = -1;
                                            }
                                        }
                                    }, 'Cancel'),
                                    h('Button', {
                                        props: {
                                            type: 'dranger',
                                            icon: 'ios-close-circle'
                                        },
                                        style: {
                                            marginLeft: '16px'
                                        },
                                        on: {
                                            click: () => {
                                                this.opcGroups[index].deleted = 1;
                                                this.deleteOpcGroup(this.opcGroups[index]);
                                                this.opcGroupEditIndex = -1;
                                            }
                                        }
                                    }, 'Delete')
                                ];
                            }else {
                                return h('Button', {
                                    props: {
                                        type: 'primary',
                                        icon: 'md-clipboard'
                                    },
                                    on: {
                                        click: () => {
                                            this.editOpcGroup.opcConnection.connectionId = row.opcConnection.connectionId;
                                            this.editOpcGroup.opcConnection.connectionName = row.opcConnection.connectionName;
                                            this.editOpcGroup.groupName = row.groupName;
                                            this.editOpcGroup.updateRate = row.updateRate;
                                            this.opcGroupEditIndex = index;
                                        }
                                    }
                                },'Edit Opc Group')
                            }
                        }
                    }
                ],
                opcGroups: [],
                isCreatedOpcGroup: false,
                createOpcGroup: {
                    groupId: '',
                    groupName: '',
                    updateRate: '',
                    opcConnection: {
                        connectionId: '',
                        connectionName: ''
                    },
                    deleted: 0,
                },
                editOpcGroup: {
                    groupName: '',
                    updateRate: '',
                    opcConnection: {
                        connectionId: '',
                        connectionName: ''
                    },
                }
             }
        },
        methods: {
            //获取下拉选择框中proIds
            getProgIds() {
                if (this.ajaxStatue.getProgIds) return;
                this.ajaxStatue.getProgIds = true;
                $.ajax({
                    url: '/opcServer/getProgIds',
                    method: 'get',
                }).then(res => {
                    this.progIds = res.data;
                    this.ajaxStatue.getProgIds = false;
                });
            },
            //opcServer 与服务器践行交互
            getOpcServer() {
                if (this.ajaxStatue.getOpcServer) return;
                this.ajaxStatue.getOpcServer = true;
                $.ajax({
                    url: '/opcServer/getOpcServer',
                    method: 'get',
                }).then(res => {
                    this.opcServer = res.data;
                    this.ajaxStatue.getOpcServer = false;
                });
            },
            editOpcServer() {
                opcServerLastTime.serverId = this.opcServer.serverId; //把从后端得到的数据存储起来，再进行修改
                opcServerLastTime.progId = this.opcServer.progId;
                opcServerLastTime.domain = this.opcServer.domain;
                opcServerLastTime.ipAddress = this.opcServer.ipAddress;
                opcServerLastTime.serverName = this.opcServer.serverName;
                opcServerLastTime.serverPassword = this.opcServer.serverPassword;
                this.cannotEditOpcServer = false;
                this.getProgIds();
            },
            exitOpcServerEdit() {
                this.opcServer.serverId = opcServerLastTime.serverId; //如果取消修改，讲保存起来的值恢复
                this.opcServer.progId = opcServerLastTime.progId;
                this.opcServer.domain = opcServerLastTime.domain;
                this.opcServer.ipAddress = opcServerLastTime.ipAddress;
                this.opcServer.serverName = opcServerLastTime.serverName;
                this.opcServer.serverPassword = opcServerLastTime.serverPassword;
                this.cannotEditOpcServer = true;
            },
            updateOpcServer() {
                if (this.ajaxStatue.updateOpcServer) return;
                this.ajaxStatue.updateOpcServer = true;
                $.ajax({
                    url: 'opcServer/updateOpcServer',
                    method: 'post',
                    data: this.opcServer
                }).then(res => {
                    this.opcServer = res.data;
                    this.ajaxStatue.updateOpcServer = false;
                    this.cannotEditOpcServer = true;
                })
            },
            //Connection 与服务器进行交互
            handlerSortChange(column, key, order) {
                this.sortType = order;
                this.key = key;
                this.getAllConnections();
            },
            getAllConnections() {
                if (this.ajaxStatue.getConnection) return;
                this.ajaxStatue.getConnection = true;
                $.ajax({
                    url: 'connection/getAllConnections',
                    method: 'get',
                    params: {
                        sortType: this.sortType,
                        key: this.key
                    }
                }).then( res => {
                   this.connections = res.data;
                   this.ajaxStatue.getConnection = false;
                });
            },
            insertConnection() {
                this.createConnection.opcServerId = 1;
                if (this.ajaxStatue.insertConnection) return;
                this.ajaxStatue.insertConnection = true;
                $.ajax({
                    url: 'connection/insertConnection',
                    method: 'post',
                    data: this.createConnection
                }).then( res => {
                    this.connections = res.data;
                    this.ajaxStatue.insertConnection = false;
                    this.isCreatedConnection = false;
                });
            },
            getProtocols() {
                if (this.ajaxStatue.getProtocols) return;
                this.ajaxStatue.getProtocols = true;
                $.ajax({
                    url: 'connection/getProtocols',
                    method: 'get',
                }).then( res => {
                   this.protocols = res.data;
                   this.ajaxStatue.getProtocols = false;
                });
            },
            updateConnection(connection) {
                if (this.ajaxStatue.updateConnection) return;
                this.ajaxStatue.updateConnection = true;
                $.ajax({
                    url: 'connection/updateConnection',
                    method: 'post',
                    data: connection
                }).then( res => {
                    this.connections = res.data;
                    this.ajaxStatue.updateConnection = false;
                });
            },
            deleteConnection(connection) {
                if (this.ajaxStatue.deleteConnection) return;
                this.ajaxStatue.deleteConnection = true;
                $.ajax({
                    url: 'connection/deleteConnection',
                    method: 'post',
                    data: connection
                }).then( res => {
                   this.connections = res.data;
                   this.ajaxStatue.deleteConnection = false;
                });
            },
            handlerNewConnectionBtnSelected(val) {
                if(val === "createConnection"){
                    this.isCreatedConnection = true;
                };
            },

            //opcGroup methods 与服务器进行交互
            insertOpcGroup() {
                if (this.ajaxStatue.insertOpcGroup) return;
                this.ajaxStatue.insertOpcGroup = true;
                $.ajax({
                    url: 'opcGroup/insertOpcGroup',
                    method: 'post',
                    data: this.createOpcGroup,
                }).then( res => {
                    this.opcGroups = res.data;
                    this.ajaxStatue.insertOpcGroup = false;
                    this.isCreatedOpcGroup = false;
                });
            },
            updateOpcGroup(group) {
                if (this.ajaxStatue.updateOpcGroup) return;
                this.ajaxStatue.updateOpcGroup = true;
                $.ajax({
                    url: 'opcGroup/updateOpcGroup',
                    method: 'post',
                    data: group,
                }).then( res => {
                    this.opcGroups = res.data;
                    this.ajaxStatue.updateOpcGroup = false;
                })
            },
            deleteOpcGroup(group) {
                if (this.ajaxStatue.deleteOpcGroup) return;
                this.ajaxStatue.deleteOpcGroup = true;
                $.ajax({
                    url: 'opcGroup/deleteOpcGroup',
                    method: 'post',
                    data: group
                }).then( res => {
                    this.opcGroups = res.data;
                    this.ajaxStatue.deleteOpcGroup = false;
                });
            },
            getAllOpcGroups() {
                if (this.ajaxStatue.getOpcGroups) return;
                this.ajaxStatue.getOpcGroups = true;
                $.ajax({
                    url: 'opcGroup/getAllOpcGroups',
                    method: 'get',
                }).then( res => {
                    this.opcGroups = res.data;
                    this.ajaxStatue.getOpcGroups = false;
                });
            },
            handlerNewOpcGroupBtnSelected(val) {
                if(val === 'createOpcGroup') {
                    this.isCreatedOpcGroup = true;
                };
            },
        },
        mounted() {
            this.getOpcServer();
            this.getAllConnections();
            this.getProtocols();
            this.getAllOpcGroups();
        },

    }
</script>

<style>
    .jumbotron{
        padding-right: 60px;
        padding-left: 60px;
        border-radius: 6px;
        margin-left: 16px;
        margin-right: 16px;
        height: 380px;
        width: 98%;
        background-image: url("../../static/img/f31fbe096b63f6243861e53a8c44ebf81a4ca3cf.jpg");
    }
    .form-server{
        margin-top: 32px;
    }
    .font-size > :first-child{
        font-size: 11px;
        color: #fff;
    }
    .connectionCard{
        margin-top: 48px;
        margin-left: 16px;
        margin-right: 16px;
    }
    .opcGroupCard{
        margin-top: 48px;
        margin-left: 16px;
        margin-right: 16px;
    }
    .connectionCard .ivu-card-head{
        background-color: #2c3e50;
        border-radius: 6px;
    }
    .font-size-connection{
        font-size: 11px;
    }

</style>