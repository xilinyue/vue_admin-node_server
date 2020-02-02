<template>
    <el-container class="home-container">
        <el-header>
            <div>
                <img src="../assets/logo.png">
                <span>电商后台管理系统</span>
            </div>
            <el-button type="info" @click="logout">退出</el-button>
        </el-header>
        <el-container>
            <el-aside :width="isCollapse?'64px':'200px'">
                <!-- 动态切换侧边栏伸缩-->
                <div class="toggle-button" @click="toggleCollapse">|||</div>
                <!--侧边导航栏区域-->
                <el-menu
                        background-color="#333744"
                        text-color="#fff"
                        active-text-color="#00a1d6"
                        unique-opened
                        :collapse="isCollapse"
                        :collapse-transition="false"
                        router
                        :default-active="activePath">
                    <el-submenu :index="menu.id + ''" v-for="menu in menuList" :key="menu.id">
                        <template slot="title">
                            <i :class="iconsObj[menu.id]"></i>
                            <span>{{menu.authName}}</span>
                        </template>
                        <el-menu-item :index="'/' + subMenu.path" v-for="subMenu in menu.children" :key="subMenu.id"
                            @click="saveNavState('/' + subMenu.path)">
                            <template slot="title">
                                <i class="el-icon-menu"></i>
                                <span>{{subMenu.authName}}</span>
                            </template>
                        </el-menu-item>
                    </el-submenu>
                </el-menu>
            </el-aside>
            <el-main>
                <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>
</template>

<script>
    export default {
        name: "Home",
        data(){
            return{
                menuList: [],
                iconsObj: {
                    '125': 'iconfont icon-users',
                    '103': 'iconfont icon-tijikongjian',
                    '101': 'iconfont icon-shangpin',
                    '102': 'iconfont icon-danju',
                    '145': 'iconfont icon-baobiao',
                },
                isCollapse: false,
                activePath: ''
            }
        },
        created() {
          this.getMenuList();
          this.activePath = window.sessionStorage.getItem('activePath');
        },
        methods: {
            logout(){
                window.sessionStorage.clear();
                this.$router.push("/login")
            },
            getMenuList(){
                this.$http.get("menus").then(res => {
                    let data = res.data;
                    if (data.meta.status != 200) {
                        this.$message.error(data.meta.msg);
                    }else{
                        this.menuList = data.data;
                    }
                });
            },
            //侧边栏伸缩
            toggleCollapse(){
                this.isCollapse = !this.isCollapse;
            },
            //保存侧边导航栏高亮样式
            saveNavState(activePath) {
                window.sessionStorage.setItem('activePath', activePath);
                this.activePath = activePath;
            }
        },
    }
</script>

<style scoped>
    .home-container {
        height: 100%;
    }
    .el-header{
        background-color: #373d41;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-left: 7px;
        color: #fff;
    }
    .el-header div{
        display: flex;
        align-items: center;
    }
    .el-header div span{
        margin-left: 15px;
        font-size: 20px;
    }
    .el-header div img{
        width: 50px;
        height: 50px;
    }
    .el-aside{
        background-color: #333744;
    }
    .el-aside .el-menu{
        border-right: none;
    }
    .el-aside .iconfont {
        margin-right: 10px;
    }
    .el-main{
        background-color: #EAEDF1;
    }
    .toggle-button{
        background-color: #4a5064;
        text-align: center;
        line-height: 30px;
        height: 30px;
        letter-spacing: 3px;
        color: #fff;
    }
</style>