<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" placeholder="标题" v-model="listQuery.title">
      </el-input>

      <el-select clearable style="width: 90px" class="filter-item" v-model="listQuery.importance" placeholder="重要性">
        <el-option v-for="item in importanceOptions" :key="item" :label="item" :value="item">
        </el-option>
      </el-select>

      <el-select clearable class="filter-item" style="width: 130px" v-model="listQuery.type" placeholder="类型">
        <el-option v-for="item in  calendarTypeOptions" :key="item.key" :label="item.display_name+'('+item.key+')'" :value="item.key">
        </el-option>
      </el-select>

      <el-select @change='handleFilter' style="width: 120px" class="filter-item" v-model="listQuery.sort" placeholder="排序">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key">
        </el-option>
      </el-select>

      <el-button class="filter-item" type="primary" v-waves icon="search" @click="handleFilter">搜索</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" @click="handleCreate" type="primary" icon="edit">添加</el-button>
      <el-button class="filter-item" type="primary" icon="document" @click="handleDownload">导出</el-button>
    </div>

    <el-table :data="list" v-loading="listLoading" element-loading-text="给我一点时间" border fit highlight-current-row style="width: 100%">
		<el-table-column type="selection"width="55"></el-table-column>
		
		
		<!--<el-table-column prop="date" label="日期"  width="180"> </el-table-column>-->
		
     <el-table-column align="center" label="序号" width="65" sortable>
        <template scope="scope">
          <span>{{scope.row.id}}</span>
        </template>
      </el-table-column>
			
      <el-table-column width="180px" align="center" label="用户名称">
        <template scope="scope">
          <span>{{scope.row.username}}</span>
        </template>
      </el-table-column>

      <el-table-column min-width="300px" label="性别">
        <template scope="scope">
          <span class="link-type" @click="handleUpdate(scope.row)">{{scope.row.title}}</span>
          <el-tag>{{scope.row.sex }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column width="110px" align="center" label="密码">
        <template scope="scope">
          <span>{{scope.row.password}}</span>
        </template>
      </el-table-column>

      <el-table-column width="110px" v-if='showAuditor' align="center" label="手机号">
        <template scope="scope">
          <span style='color:red;'>{{scope.row.phone}}</span>
        </template>
      </el-table-column>






      <el-table-column align="center" label="操作" width="150">
        <template scope="scope">
          <el-button v-if="scope.row.status!='published'" size="small" type="success" @click="handleUpdate(scope.row)">编辑
          </el-button>
          <el-button v-if="scope.row.status!='deleted'" size="small" type="danger" @click="handleDelete(scope.row)">删除
          </el-button>
        </template>
      </el-table-column>

    </el-table>

    <div v-show="!listLoading" class="pagination-container">
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="listQuery.page"
        :page-sizes="[10,20,30, 50]" :page-size="listQuery.limit" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <el-dialog :title="dialogTitle" :visible.sync="dialogFormVisible">
      <el-form class="small-space" :rules="rules" :model="temp" label-position="left" label-width="70px" style='width: 400px; margin-left:50px;'>
        <el-form-item label="用户名" prop="name">
          <el-input type="text" placeholder="请输入用户名" v-model.trim="temp.username">
          </el-input>
        </el-form-item>
        
        <el-form-item label="性别">
          
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input type="text" placeholder="请输入邮箱" v-model.trim="temp.email">
           </el-input>
        </el-form-item>	
        <el-form-item label="手机号码">
          <el-input type="text" placeholder="请输入手机号码" v-model.trim="temp.phone">
          </el-input>
        </el-form-item>	


        <el-form-item label="备注">
          <el-input type="textarea"  placeholder="请输入内容" v-model="temp.remark">
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button  type="primary" @click="update">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { fetchList, DeleteUser, AddUser, UpdateUser } from '@/api/user'
import waves from '@/directive/waves/index.js' // 水波纹指令


 

export default {
  name: 'table_demo',
  directives: {
    waves
  },
  data() {
    return {
      list: null,
      total: null,
      listLoading: true,
       ruleForm: {
          name: '',
          region: '',
          date1: '',
          date2: '',
          delivery: false,
          type: [],
          resource: '',
          desc: ''
        },
      rules: {
          name: [
            { required: true, message: '请输入活动名称', trigger: 'blur' },
            { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
          ],
          region: [
            { required: true, message: '请选择活动区域', trigger: 'change' }
          ],
          date1: [
            { type: 'date', required: true, message: '请选择日期', trigger: 'change' }
          ],
          date2: [
            { type: 'date', required: true, message: '请选择时间', trigger: 'change' }
          ],
          type: [
            { type: 'array', required: true, message: '请至少选择一个活动性质', trigger: 'change' }
          ],
          resource: [
            { required: true, message: '请选择活动资源', trigger: 'change' }
          ],
          desc: [
            { required: true, message: '请填写活动形式', trigger: 'blur' }
          ]
       },
      listQuery: {
        page: 1,
        limit: 20
      },
      temp: {
        username: '',
        password: '888888',
        sex: '',
        email: '',
        phone: '',
        remark: ''
      },
      dialogFormVisible: false,
      dialogTitle: '',

    }
  },
  created() {
    this.getList()
  },
  methods: {
  	submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            alert('submit!');
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },
      resetForm(formName) {
        this.$refs[formName].resetFields();
     },
  	//获取用户的列表方法
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data.data
        this.total = response.data.count
        console.log(response.data)
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleSizeChange(val) {
      this.listQuery.limit = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.getList()
    },
    timeFilter(time) {
      if (!time[0]) {
        this.listQuery.start = undefined
        this.listQuery.end = undefined
        return
      }
      this.listQuery.start = parseInt(+time[0] / 1000)
      this.listQuery.end = parseInt((+time[1] + 3600 * 1000 * 24) / 1000)
    },
    //添加显示的模态框
    handleCreate() {
      this.resetTemp()
      this.dialogTitle = '添加用户'
      this.dialogFormVisible = true
    },
    //编辑的模态框
    handleUpdate(row) {
      this.temp = Object.assign({}, row)
      this.dialogTitle = '修改用户'
      this.dialogFormVisible = true
    },
    //删除数据
    handleDelete(row) {
    	this.$confirm('你确定要删除么?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          var data = { userId: row.id}
		        DeleteUser(data)
		        .then((reult)=>{
		    		 if(!reult.error_code){
		    		 	this.$notify({
		          title: '成功',
		          message: '删除成功',
		          type: 'success',
		          duration: 2000
		          })
		    			 //重新加载数据
		            this.getList()
			          
			    	  }else{
			    	    this.$notify({
			          title: '失败',
			          message: '删除失败',
			          type: 'error',
			          duration: 2000
			          })
			    	  }
			    		
			    	   },()=>{
			    		  console.log('操作失败')
			       })
		          
		        })
    	  
    },
    //添加数据
    update() {
      //判断是新增还是修改，根据id判断，如果是true则是修改操作，否则是添加操作
      if(this.temp.id){
       UpdateUser(this.temp)
      .then((reult)=>{
    		if(!reult.error_code){
          //关闭模态框
    			this.dialogFormVisible=false
    			//重新加载数据
          this.getList()
          
    		}
    		
    	},()=>{
    		console.log('操作失败')
     })
      }else{
      
    	AddUser(this.temp)
      .then((reult)=>{
    		if(!reult.error_code){
          //关闭模态框
    			this.dialogFormVisible=false
          this.getList()
          
    		}
    		
    	  },()=>{
    		  console.log('操作失败')
       })
      }
    },
    //重置对象
    resetTemp() {
      this.temp = {
        username: '',
        password: '888888',
        sex: '',
        email: '',
        phone: '',
        remark: ''
      }
    },
    handleDownload() {
      require.ensure([], () => {
        const { export_json_to_excel } = require('vendor/Export2Excel')
        const tHeader = ['时间', '地区', '类型', '标题', '重要性']
        const filterVal = ['timestamp', 'province', 'type', 'title', 'importance']
        const data = this.formatJson(filterVal, this.list)
        export_json_to_excel(tHeader, data, 'table数据')
     })
    },
  }
}
</script>
