<template>
    <div id="login">
        <el-form class="login-form"  ref="loginFormRef" :rules="loginFormRules" label-position="top" label-width="80px" :model="formData">
            <h2>用户登录</h2>
            <el-form-item label="用户名" prop="username">
                <el-input v-model="formData.username"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
                <el-input v-model="formData.password" type="password"></el-input>
            </el-form-item>
            <div class="login-btn">
                <el-button type="primary" @click="login">登录</el-button>
                <el-button type="info" @click="resetForm">重置</el-button>
            </div>
        </el-form>
    </div>
</template>

<script>
    export default {
        name: "login",
        data(){
            return{
                formData: {
                    username: 'admin',
                    password: '123456'
                },
                loginFormRules: {
                    username: [
                        { required: true, message: '请输入用户名', trigger: 'blur'},
                        { min: 3, max: 10, message: '用户名长度在 3 到 10 之间', trigger: 'blur'}
                    ],
                    password: [
                        { required: true, message: '请输入密码', trigger: 'blur'},
                        { min: 6, max: 15, message: '用户名长度在 6 到 15 之间', trigger: 'blur'}
                    ],
                }
            }
        },
        methods: {
            //重置表单
            resetForm() {
                this.$refs.loginFormRef.resetFields();
            },
            //提交登录按钮
            login(){
                this.$refs.loginFormRef.validate(valid => {
                    if (valid) {
                        this.$http.post('login',this.formData).then(res => {
                            if(res.status == 200) {
                                let data = res.data;
                                if (data.meta.status == 200){
                                    this.$message.success('登录成功');
                                    window.sessionStorage.setItem('token',data.data.token);
                                    this.$router.push("/home");
                                }else{
                                    this.$message.error(data.meta.msg);
                                }
                            }else{
                                this.$message.error('后台错误');
                            }
                        })
                    }
                })
            }
        }
    }
</script>

<style scoped>
    #login{
        height: 100%;
        background-color: #324152;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    #login .login-form{
        width: 400px;
        padding: 30px;
        border-radius: 5px;
        background-color: #fff;
    }
    #login .login-btn{
    }
</style>