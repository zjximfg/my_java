<template>
    <!--ITEMS-->
    <Card class="itemsCard" shadow>
        <h2>Opc Items in Group {{opcGroup.groupName}}</h2>
        <Menu mode="horizontal" theme="dark" @on-select="handlerMenuItemSelected" style="margin-top: 8px;">
            <MenuItem name="createOpcGroup">
                <Icon type="md-add"/>
                New Opc Item
            </MenuItem>
            <Submenu name="file">
                <template slot="title">
                    <Icon type="ios-stats"/>
                    File Edit
                </template>
                <MenuItem name="import">
                    <Icon type="md-add"/>
                    Import from EXCEL
                </MenuItem>
                <MenuItem name="export">
                    <Icon type="md-add"/>
                    Export to EXCEL
                </MenuItem>
            </Submenu>
            <MenuItem class="searchBox">
                <Input search enter-button v-model="searchKey" placeholder="Please input a key word to search"
                       style="width: 400px; margin-right: 16px" @on-search="searchItemsByKey"/>
            </MenuItem>
        </Menu>
        <Table style="margin-top: 16px"
               :columns="opcItemsColumns"
               :data="opcItems"
               border="true"
               size="small"
               align="center"
               :loading="ajaxStatue.getOpcItemsByPage">
        </Table>
        <div style="margin-top: 16px">
            <Page :total="totalCount"
                  :current.sync="currentPage"
                  :page-size="pageSize"
                  show-sizer
                  @on-change="getOpcItemsByPage"
                  @on-page-size-change="handlerSizeChange">
            </Page>
        </div>
        <!--新建OpcItems的弹出对话框-->
        <Modal v-model="openModal"
               cancel-text="Cancel"
               :title="modalType === 'create' ? 'Create a new Opc Item' : 'Edit an Opc item'"
               :okText="modalType === 'create' ? 'Create' : 'Save'"
               :width="600"
               draggable
               @on-ok="handleModalOk">
            <Form :label-width="100">
                <FormItem label="Item Catalog" class="font-size-items">
                    <Select v-model="modalOpcItem.itemCatalog" placeholder="Please select a Item Catalog">
                        <Option v-for="itemCatalog in itemCatalogs" :value="itemCatalog" :key="itemCatalog">
                            {{itemCatalog}}
                        </Option>
                    </Select>
                </FormItem>
                <FormItem label="DB Number" class="font-size-items" v-show="showDbNum">
                    <InputNumber v-model="modalOpcItem.dbNum"/>
                </FormItem>
                <FormItem label="Data Type" class="font-size-items">
                    <Select v-model="modalOpcItem.dataType">
                        <Option v-for="dataType in dataTypes" :value="dataType" :key="dataType">
                            {{dataType}}
                        </Option>
                    </Select>
                </FormItem>
                <FormItem label="Data Address" class="font-size-items">
                    <InputNumber v-model="modalOpcItem.dataAddressNum"/>
                </FormItem>
                <FormItem label="Data Bit Offset" class="font-size-items" v-show="showBitOffset">
                    <InputNumber v-model="modalOpcItem.dataBitOffset"/>
                </FormItem>
                <FormItem label="Item Name" class="font-size-items">
                    <Input v-model="modalOpcItem.itemName" disabled/>
                </FormItem>
                <FormItem label="Item Description" class="font-size-items">
                    <Input v-model="modalOpcItem.comment" type="textarea" :autosize="{minRows: 2,maxRows: 5}"/>
                </FormItem>
                <FormItem label="As an Alarm" class="font-size-items">
                    <i-switch v-model="modalOpcItem.isAlarm" @on-change="handleAlarmChange"/>
                </FormItem>
            </Form>
        </Modal>
    </Card>
</template>

<script>
    import $ from '../../libs/utils';

    export default {
        name: "Group.vue",
        data() {
            return {
                ajaxStatue: {
                    getOpcGroupById: false,
                    getDataTypes: false,
                    getItemCatalogs: false,
                    getItemName: false,
                    getOpcConnectionById: false,
                    insertOpcItem: false,
                    getOpcItemsByPage: false,
                    updateOpcItem: false,
                    deleteOpcItem: false,
                },
                dataTypes: [],
                itemCatalogs: [],
                opcGroup: {},
                opcConnection: {},
                searchKey: '',
                openModal: false,
                modalType: 'create', //create or edit
                modalOpcItem: {
                    itemCatalog: '',
                    dbNum: 0,
                    dataType: '',
                    dataAddressNum: 0,
                    dataBitOffset: 0,
                    itemName: '',
                    comment: '',
                    isAlarm: 0,
                    opcConnection: {},
                    opcGroup: {}
                },
                nullOpcItem: {
                    itemCatalog: '',
                    dbNum: 0,
                    dataType: '',
                    dataAddressNum: 0,
                    dataBitOffset: 0,
                    itemName: '',
                    comment: '',
                    isAlarm: 0,
                    opcConnection: {},
                    opcGroup: {}
                },
                showDbNum: false,
                showBitOffset: false,
                opcItems: [],
                totalCount: 1,
                currentPage: 1,
                pageSize: 10,
                opcItemsColumns: [
                    {
                        title: 'Item Id',
                        key: 'itemId',
                        width: 80
                    },
                    {
                        title: 'Item Name',
                        key: 'itemName'
                    },
                    {
                        title: 'Current Value',
                        render: (h, {row, index}) => {
                            let value = null;
                            this.opcItemStates.forEach((i, opcItemState) => {
                                if (opcItemState.itemId === row.itemId) {
                                    value = opcItemState.value;
                                }
                            });
                            return h('div', [value]);
                        }
                    },
                    {
                        title: 'Comment',
                        key: 'comment'
                    },
                    {
                        title: "Alarm or not",
                        render: (h, {row, index}) => {
                            let boolValue = false;
                            if (row.isAlarm === 0) {
                                boolValue = false;
                            }
                            if (row.isAlarm === 1) {
                                boolValue = true;
                            }
                            return h('i-switch', {
                                props: {
                                    value: boolValue,
                                    disabled: true
                                }
                            });
                        }
                    },
                    {
                        title: 'Action',
                        render: (h, {row, index}) => {
                            return [
                                h('Button', {
                                    props: {
                                        type: 'success',
                                        icon: 'ios-checkmark-circle'
                                    },
                                    on: {
                                        click: () => {
                                            //打开修改页面
                                            this.editIndex = index;
                                            this.modalOpcItem = Object.assign({}, this.opcItems[index]);
                                            this.openModal = true;
                                            this.modalType = 'edit';
                                        }
                                    }
                                }, 'Edit'),
                                h('Button', {
                                    props: {
                                        type: 'warning',
                                        icon: 'ios-close-circle',
                                    },
                                    style: {
                                        marginLeft: '16px'
                                    },
                                    on: {
                                        click: () => {
                                            this.deleteOpcItem(index);
                                        }
                                    }
                                }, 'Delete')
                            ];
                        }
                    }
                ],
                opcItemStates: [],
                editIndex: -1,
            }
        },
        methods: {
            getOpcGroupById() {
                if (this.ajaxStatue.getOpcGroupById) return;
                this.ajaxStatue.getOpcGroupById = true;
                $.ajax({
                    url: 'opcGroup/getOpcGroupById',
                    method: 'get',
                    params: {
                        groupId: this.$route.params.id,
                    }
                }).then(res => {
                    this.opcGroup = res.data;
                    this.ajaxStatue.getOpcGroupById = false;
                    this.getOpcConnectionById();
                    this.opcGroup.opcConnection = this.opcConnection;
                });
            },
            getOpcConnectionById() {
                if (this.ajaxStatue.getOpcConnectionById) return;
                this.ajaxStatue.getOpcConnectionById = true;
                $.ajax({
                    url: 'connection/getOpcConnectionById',
                    method: 'get',
                    params: {
                        connectionId: this.opcGroup.opcConnectionId,
                    }
                }).then(res => {
                    this.opcConnection = res.data;
                    this.ajaxStatue.getOpcConnectionById = false;
                });
            },
            getDataTypes() {
                if (this.ajaxStatue.getDataTypes) return;
                this.ajaxStatue.getDataTypes = true;
                $.ajax({
                    url: 'opcItem/getDataTypes',
                    method: 'get'
                }).then(res => {
                    this.dataTypes = res.data;
                    this.ajaxStatue.getDataTypes = false;
                });
            },
            getItemCatalogs() {
                if (this.ajaxStatue.getItemCatalogs) return;
                this.ajaxStatue.getItemCatalogs = true;
                $.ajax({
                    url: 'opcItem/getItemCatalogs',
                    method: 'get'
                }).then(res => {
                    this.itemCatalogs = res.data;
                    this.ajaxStatue.getItemCatalogs = false;
                });
            },
            getItemName() {
                this.modalOpcItem.opcGroup = this.opcGroup;
                this.modalOpcItem.opcConnection = this.opcConnection;
                if (this.ajaxStatue.getItemName) return;
                this.ajaxStatue.getItemName = true;
                $.ajax({
                    url: 'opcItem/getItemName',
                    method: 'post',
                    data: this.modalOpcItem
                }).then(res => {
                    this.modalOpcItem.itemName = res.data;
                    this.ajaxStatue.getItemName = false;
                });
            },
            insertOpcItem() {
                if (this.ajaxStatue.insertOpcItem) return;
                this.ajaxStatue.insertOpcItem = true;
                $.ajax({
                    url: 'opcItem/insertOpcItem',
                    method: 'post',
                    data: this.modalOpcItem
                }).then(res => {
                    this.ajaxStatue.insertOpcItem = false;
                    this.getOpcItemsByPage();
                })
            },
            getOpcItemsByPage() {
                if (this.ajaxStatue.getOpcItemsByPage) return;
                this.ajaxStatue.getOpcItemsByPage = true;
                $.ajax({
                    url: 'opcItem/getOpcItemsByPage',
                    method: 'get',
                    params: {
                        currentPage: this.currentPage,
                        pageSize: this.pageSize,
                        searchKey: this.searchKey
                    }
                }).then(res => {
                    this.opcItems = res.data.items;
                    this.totalCount = res.data.totalCount;
                    this.ajaxStatue.getOpcItemsByPage = false;
                })
            },
            handleAlarmChange(val) {
                if (val) {
                    this.modalOpcItem.isAlarm = 1;
                } else {
                    this.modalOpcItem.isAlarm = 0;
                }
            },
            //NEW
            handlerMenuItemSelected(menuItemName) {
                if (menuItemName === 'createOpcGroup') {
                    this.openModal = true;
                    this.modalType = 'create';
                    this.modalOpcItem = Object.assign({}, this.nullOpcItem);
                }
            },
            handleModalOk() {
                if (this.modalType === 'create') {
                    //新建
                    this.insertOpcItem();
                    this.openModal = false;
                } else {
                    //修改
                    this.updateOpcItem();
                    this.openModal = false;
                }
            },
            updateOpcItem() {
                if (this.ajaxStatue.updateOpcItem) return;
                this.ajaxStatue.updateOpcItem = true;
                $.ajax({
                    url: 'opcItem/updateOpcItem',
                    method: 'post',
                    data: this.modalOpcItem
                }).then(res => {
                    this.ajaxStatue.updateOpcItem = false;
                    this.getOpcItemsByPage();
                })
            },
            deleteOpcItem(index) {
                if (this.ajaxStatue.deleteOpcItem) return;
                this.ajaxStatue.deleteOpcItem = true;
                $.ajax({
                    url: 'opcItem/deleteOpcItem',
                    method: 'post',
                    data: this.opcItems[index]
                }).then(res => {
                    this.ajaxStatue.deleteOpcItem = false;
                    this.getOpcItemsByPage();
                })

            },
            searchItemsByKey() {
                this.getOpcItemsByPage();
            },
            handlerSizeChange(val) {
                this.pageSize = val;
                this.getOpcItemsByPage();
            }

        },
        mounted() {
            this.getOpcGroupById();
            this.getDataTypes();
            this.getItemCatalogs();
            this.getOpcItemsByPage();
        },
        watch: {
            modalOpcItem: {
                handler(newVal, oldVal) {
                    if (newVal.itemCatalog === 'DB') {
                        this.showDbNum = true;
                    } else {
                        this.showDbNum = false;
                    }
                    if (newVal.dataType === 'X') {
                        this.showBitOffset = true;
                    } else {
                        this.showBitOffset = false;
                    }
                    if (newVal.itemName === oldVal.itemName && newVal.opcConnection !== null && newVal.opcGroup !== null) {
                        this.getItemName();
                    }

                },
                deep: true,
            },
        }
    }
</script>

<style>
    .itemsCard {
        margin-top: 18px;
        margin-left: 16px;
        margin-right: 16px;
    }

    .searchBox {

        align-content: center;
        margin-left: 800px;
        margin-top: 14px;
    }

    .font-size-items {
        font-size: 11px;
    }

</style>