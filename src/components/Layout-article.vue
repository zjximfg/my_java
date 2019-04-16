<template>
    <Layout class="layout">
        <Header class="header">
            <Row>
                <i-col span="4" offset="1">
                    <img alt="logo" src="../assets/logo.gif" class="logo"/>
                </i-col>
                <i-col span="14" offset="">
                    <Menu mode="horizontal" active-name="/opc/connection">
                        <MenuItem name="/opc/connection" to="/opc/connection">OPC manage</MenuItem>
                        <MenuItem name="/push" to="/push">Alarms</MenuItem>
                        <MenuItem name="/dev" to="/dev">Data analysis</MenuItem>
                        <MenuItem name="/manage" to="/manage">User</MenuItem>
                    </Menu>
                </i-col>
                <i-col span="4">
                    <Row>
                        <i-col span="8">
                            <Dropdown>
                                <Avatar :style="{background: color}">{{ user }}</Avatar>
                                <DropdownMenu slot="list">
                                    <DropdownItem>我的主页</DropdownItem>
                                    <DropdownItem>我的收藏</DropdownItem>
                                    <DropdownItem>
                                        设置
                                        <Badge status="error"></Badge>
                                    </DropdownItem>
                                    <DropdownItem divided="true">退出登录</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        </i-col>
                        <i-col span="8">
                            <Dropdown>
                                <Badge :count="count" :offset="[20,4]">
                                    <Icon type="md-notifications-outline" size="24"></Icon>
                                </Badge>
                                <DropdownMenu slot="list">
                                    <Tabs value="name1">
                                        <TabPane label="通知" name="notification">
                                            <div class="notification">通知内容</div>
                                        </TabPane>
                                        <TabPane label="关注" name="follow">
                                            <div class="notification">关注内容</div>
                                        </TabPane>
                                        <TabPane label="系统" name="system">
                                            <div class="notification">系统内容</div>
                                        </TabPane>
                                    </Tabs>
                                </DropdownMenu>
                            </Dropdown>
                        </i-col>
                        <i-col span="8">
                            <Icon type="md-color-palette" size="24" @click="isOpened = true"></Icon>
                        </i-col>
                    </Row>
                </i-col>
            </Row>
        </Header>
        <Layout>
            <Sider class="sider" width="240" collapsible v-model="isCollapsible" :class="{'span-hide' :  isCollapsible}">
                <Menu class="sider-menu" theme="dark" active-name="opcServer">
                    <MenuItem name="opcServer" to="/opc/connection">
                        <Icon type="md-home" />
                        <span>OPC Server</span>
                    </MenuItem>
                    <Submenu v-for="connection in connectionMenu" :name="connection.connectionName">
                        <template slot="title">
                            <Icon type="ios-analytics" />
                            <span>{{connection.connectionName}}</span>
                        </template>
                        <MenuItem v-for="group in connection.opcGroups" :name="group.groupId" :to="{ name: 'group', params: { id: group.groupId }}">
                                <Icon type="md-analytics" />
                                <span>{{group.groupName}}</span>
                        </MenuItem>
                    </Submenu>
                </Menu>
            </Sider>
            <Content class="content" :class="{'content-extend' : isCollapsible}">
                <router-view @connectionChange="getMenu" @opcGroupChange="getMenu"></router-view>
            </Content>
        </Layout>
        <Drawer title="选择配色" v-model="isOpened">

        </Drawer>
    </Layout>
</template>

<script>
    import $ from '../libs/utils';
    export default {
        name: "Layout-article",
        props: {
            //activeName_Menu: this.activeNameMenu,
        },
        data() {
            return{
                menuLoading: false,
                //假数据
                connectionMenu: [],
                activeName: this.$route.path,
                count: 2,
                isOpened: false,
                isCollapsible: false
            }
        },
        created() {
            this.activeName = this.$route.path;

        },
        computed: {},
        methods: {
            getMenu() {
                if (this.menuLoading) return;
                this.menuLoading = true;

                $.ajax({
                    url: 'connection/getConnectionMenu',
                    method: 'get',
                }).then( res=> {
                    this.connectionMenu = res.data;
                    this.menuLoading = false;
                });
            },
        },
        mounted() {
            this.getMenu();
        }
    };
</script>

<style>
    .layout{
        width: 100%;
        height: 6000px;
        background-color: #f8f8f9;
    }
    .header{
        position: fixed;
        width: 100%;
        height: 60px;
        background-color: #fff;
        box-shadow: 0 1px 1px #333333;
        z-index: 2;
    }
    .logo{
        height: 50px;
        margin-top: 5px;
    }
    .notification{
        text-align: center;
        height: 200px;
    }
    .sider{
        position: fixed;
        height: 100%;
        left: 0;
        overflow: auto;
        z-index: 1;
    }
    .sider-menu{
        margin-top: 60px;
    }
    .span-hide span{
        display: none;
    }
    .content{
        margin-top: 60px;
        margin-left: 240px;
        padding: 16px;
        transition: all 0.5s ease-in-out;
    }
    .content-extend{
        margin-left: 64px;
    }
</style>