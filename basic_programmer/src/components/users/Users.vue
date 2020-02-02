<template>
    <div>
        <!--面包屑-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!--卡片-->
        <el-card>
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model="queryParams.query"
                    clearable
                    @clear="getUserList">
                        <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
                </el-col>
            </el-row>
            <el-table :data="userList" border stripe>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="姓名" prop="username"></el-table-column>
                <el-table-column label="邮箱" prop="email"></el-table-column>
                <el-table-column label="电话" prop="mobile"></el-table-column>
                <el-table-column label="角色" prop="role_name"></el-table-column>
                <el-table-column label="状态" prop="mg_state">
                    <template slot-scope="scope">
                        <el-switch
                                v-model="scope.row.mg_state"
                                @change="userStateChange(scope.row)">
                        </el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180">
                    <template slot-scope="scope">
                        <!--修改  -->
                        <el-button type="primary" icon="el-icon-edit" size="mini"
                                    @click="getUserInfo(scope.row.id)"></el-button>
                        <!-- 删除 -->
                        <el-button type="warning" icon="el-icon-delete" size="mini"
                                    @click="deleteUserById(scope.row.id)"></el-button>
                        <!-- 分配角色 -->
                        <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
                            <el-button type="danger" @click="showSetRolesDialog(scope.row)" icon="el-icon-setting" size="mini"></el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page="queryParams.pagenum"
                    :page-sizes="[1, 2, 5, 10]"
                    :page-size="queryParams.pagesize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="total">
            </el-pagination>
        </el-card>
        <!--添加用户-->
        <el-dialog
                title="添加用户"
                :visible.sync="addDialogVisible"
                width="50%"
                :close-on-click-modal="false"
                @close="addDialogClosed">
            <el-form ref="addFormRef" :model="addForm" label-width="70px"
                :rules="addFormRule">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="addForm.username"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="addForm.password"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="addForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机号" prop="mobile">
                    <el-input v-model="addForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addUser">确 定</el-button>
            </span>
        </el-dialog>
        <!--修改用户信息-->
        <el-dialog
                title="修改用户信息"
                :visible.sync="editDialogVisible"
                width="50%"
                :close-on-click-modal="false"
                @close="editDialogClosed">
            <el-form ref="editFormRef" :model="editForm" label-width="70px"
                     :rules="editFormRules">
                <el-form-item label="用户名">
                    <el-input v-model="editForm.username" disabled></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="editForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机号" prop="mobile">
                    <el-input v-model="editForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editUser">确 定</el-button>
            </span>
        </el-dialog>
        <!--分配角色-->
        <el-dialog
                title="分配角色"
                :visible.sync="setRolesDialogVisible"
                width="50%"
                :close-on-click-modal="false"
                @close="setRolesDialogClosed">
            <div>
                <p>当前的用户：{{userInfo.username}}</p>
                <p>当前的角色：{{userInfo.role_name}}</p>
                <p>分配新角色：
                    <el-select v-model="roleId" placeholder="请选择">
                        <el-option
                                v-for="item in rolesList"
                                :key="item.id"
                                :label="item.roleName"
                                :value="item.id">
                        </el-option>
                    </el-select>
                </p>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRolesDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveUserRoles">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: "Users",
        data(){
            //验证邮箱
            let checkEmail = (rule, value, callBack) => {
                const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
                if (regEmail.test(value)){
                    return callBack();
                }
                callBack(new Error('请输入合法的邮箱'));
            };
            //验证手机号
            let checkMobile = (rule, value, callBack) => {
                const regMobile = /^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
                if (regMobile.test(value)){
                    return callBack();
                }
                callBack(new Error('请输入合法的手机号'));
            };
            return{
                queryParams: {
                    query: '',
                    pagenum: 1,
                    pagesize: 2
                },
                userList: [],
                total: 0,
                //控制添加用户dialog显示与隐藏
                addDialogVisible: false,
                //添加用户表单
                addForm: {
                    username: '',
                    password: '',
                    email: '',
                    mobile: ''
                },
                addFormRule: {
                    username: [
                        { required: true, message: '请输入用户名', trigger: 'blur' },
                        { min: 3, max: 10, message: '用户名长度在3~10个字符之间', trigger: 'blur' }
                    ],
                    password: [
                        { required: true, message: '请输入密码', trigger: 'blur' },
                        { min: 6, max: 15, message: '密码长度在6~15个字符之间', trigger: 'blur' }
                    ],
                    email: [
                        { required: true, message: '请输入邮箱', trigger: 'blur' },
                        { validator: checkEmail, trigger: 'blur'}
                    ],
                    mobile: [
                        { required: true, message: '请输入手机号', trigger: 'blur' },
                        { validator: checkMobile, trigger: 'blur'}
                    ]
                },
                editForm: {},
                editDialogVisible: false,
                editFormRules: {
                    email: [
                        {required: true, message: '请输入用户邮箱', trigger: 'blur'},
                        {validator: checkEmail, trigger: 'blur'},
                    ],
                    mobile: [
                        {required: true, message: '请输入用户手机号', trigger: 'blur'},
                        {validator: checkMobile, trigger: 'blur'},
                    ]
                },
                setRolesDialogVisible: false,
                userInfo: {},
                rolesList: [],
                roleId: '',
            }
        },
        created() {
            this.getUserList();
        },
        methods: {
            async getUserList () {
                const { data : res}  = await this.$http.get('/users', {params : this.queryParams});
                if (res.meta.status !== 200) {
                    return this.$message.error(res.meta.msg);
                }
                this.userList = res.data.users;
                this.total = res.data.total;
            },
            //个数改变
            handleSizeChange(newSize){
                // console.log(newSize);
                this.queryParams.pagesize = newSize;
                this.getUserList();
            },
            //页数改变
            handleCurrentChange(newPage){
                this.queryParams.pagenum = newPage;
                this.getUserList();
            },
            //修改用户状态
            async userStateChange(userInfo){
                const {data: res} = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`);
                if (res.meta.status !== 200){
                    userInfo.mg_state = !userInfo.mg_state;
                    return this.$message.error(res.meta.msg);
                }
                this.$message.success(res.meta.msg);
            },
            addDialogClosed() {
                this.$refs.addFormRef.resetFields();
            },
            //添加用户
            addUser() {
                this.$refs.addFormRef.validate(valid => {
                    if(valid){
                        this.$http.post('users',this.addForm).then(res => {
                           let data = res.data;
                           if(data.meta.status !== 201){
                               this.$message.error(data.meta.msg);
                           }else{
                               this.$message.success('添加用户成功');
                               this.$refs.addFormRef.resetFields();
                               this.addDialogVisible = false;
                               this.getUserList();
                           }
                        });
                    }
                })
            },
            editDialogClosed(){
                this.$refs.editFormRef.resetFields();
            },
            //查询用户信息赋值给editForm
            getUserInfo(id){
                this.$http.get('users/' + id).then((res) => {
                   let data = res.data;
                   if (data.meta.status !== 200){
                       return this.$message.error('获取用户信息失败');
                   }
                   this.editDialogVisible = true;
                   this.editForm = data.data;
                })
            },
            //修改用户
            async editUser(){
                const {data : res} = await this.$http.put('users/' + this.editForm.id,
                {email: this.editForm.email, mobile: this.editForm.mobile});
                if (res.meta.status !== 200){
                    return this.$message.error(res.meta.msg);
                }
                this.$message.success('更新用户信息成功');
                this.editDialogVisible = false;
                this.getUserList();
            },
            //删除用户
            deleteUserById(id){
                this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.$http.delete('users/'+id).then((res) => {
                        let data = res.data;
                        if (data.meta.status !== 200){
                            return this.$message.error('删除用户失败');
                        }
                        this.$message({
                            type: 'success',
                            message: '删除成功!'
                        });
                        this.getUserList();
                    });
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });
                });
            },
            //打开分配角色对话框
            showSetRolesDialog(userInfo){
                this.userInfo = userInfo;
                this.setRolesDialogVisible = true;
                this.getRolesList();
            },
            getRolesList() {
                this.$http.get('roles').then((res) => {
                    let data = res.data;
                    if(data.meta.status !== 200){
                        return this.$message.error('获取角色列表失败');
                    }
                    this.rolesList = data.data;

                });
            },
            saveUserRoles() {
                this.$http.put(`users/${this.userInfo.id}/role`, {rid : this.roleId})
                    .then((res) => {
                       let data = res.data;
                       if (data.meta.status !== 200){
                           return this.$message.error('分配用户角色失败');
                       }
                       this.$message.success(data.meta.msg);
                       this.setRolesDialogVisible = false;
                       this.getUserList();
                    });
            },
            setRolesDialogClosed() {
                this.roleId = '';
                this.userInfo = {}
            }
        }
    }
</script>

<style scoped>

</style>