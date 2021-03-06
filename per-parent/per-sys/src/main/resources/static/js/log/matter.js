var vm = new Vue({
   el: "#app",
   data:function(){
       return {
           loading: true,
           search:{
               username:"",
               ip:"",
               method:"",
               times:[],
               sortField:"",
               sortBy:"desc"
           },
           data:[],
           pager:{
               currentPage: 1,
               pageSize: 10,
               total: 0
           },
           options:{
               height: 500,
               dialogHeight:350,
               filterBtn:false,
               editBtn: false,
               excelBtn: true,
               menu: true,
               selection: true,
               selectClearBtn: true,
               searchShow: false,
               printBtn: true,
               viewBtn: true,
               border:true,
               addBtn: false,
               align:'center',
               menuAlign:'center',
               column:[
                   {
                       label:'ID',
                       prop:'id',
                       slot: true,
                       hide: true
                   },
                    {
                       label:'操作用户',
                       prop:'username',
                       slot: true,
                       sortable: true
                   }, {
                       label:'ip',
                       prop:'ip',
                       slot: true,
                       sortable: true
                   }, {
                       label:'操作角色',
                       prop:'roles',
                       slot: true,
                       type: "textarea"
                   }, {
                       label:'操作权限',
                       prop:'permissions',
                       slot: true,
                       hide: true,
                       type: "textarea"
                   }, {
                       label:'操作时间',
                       prop:'operationTime',
                       slot: true,
                       sortable: true,
                       type: "datetime"
                   }, {
                       label:'操作方法',
                       prop:'method',
                       slot: true,
                       type: "textarea",
                       hide: true
                   }, {
                       label:'方法形参',
                       prop:'parameters',
                       slot: true,
                       hide: true
                   }, {
                       label:'填入参数',
                       prop:'args',
                       slot: true,
                       hide: true,
                       type: "textarea"
                   },{
                       label:"操作状态",
                       prop:"state",
                       slot: true,
                       sortable: true
                   },{
                       label:"异常信息",
                       prop:"exMsg",
                       hide: true,
                       type:"textarea"
                   }
               ]
           },
           sortFields:[
               "id",
               "username",
               "ip",
               "operationTime"
           ]
       }
   },
    filters:{
        lengthFilter:function(old,p){
            try{
                if(old && old.length <= p){
                    return old;
                }
                return old.substr(0,p) + "..." || old;
            }catch (e) {
                return old;
            }
        }
    },
   methods:{
       confirm:function(options,fn,reject){
           this.$confirm(options.title || "确认删除吗?",options.msg || "警告",{
               type: options.type || "warning"
           }).then(fn).catch(reject || function(){})
       },
       //重置搜索按钮回调
       searchReset:function(){
         this.search = {
             times:[],
             sortBy: "desc"
         }
       },
       //删除选中的行
       delSelect:function(){
           var ids = this.$refs.crud.tableSelect.map(function(item){
               return item.id;
           });
           if(ids.length < 1){
               this.$message.warning("请选择要删除的行");
               return ;
           }
           this.confirm({
               title:"确认批量删除吗?",
               msg:"危险",
               type:"error"
           },function(){
               var load = vm.$loading({text:"删除中..."});
               requestDel({
                   url:"/log/delete/matters/" + ids.join(",")
               }).then(function(res){
                   load.close();
                   if(res.code == 200){
                       vm.$message.success("删除成功");
                       vm.loadMatterLog();
                   }else{
                       vm.$message.error("删除失败");
                   }
               }).catch(function(err){
                   load.close();
                   vm.$message.error("删除失败");
               })
           })
       },
       //删除按钮事件
       del:function(data,index){
         this.confirm({},function(){
             var id = data.id;
             var load = vm.$loading({text:"删除中..."});
             requestDel({
                 url:"/log/delete/matter/" + id
             }).then(function(res){
                 load.close();
                 if(res.code == 200){
                     vm.$message.success("删除成功");
                     vm.loadMatterLog();
                 }else{
                     vm.$message.error("删除失败");
                 }
             }).catch(function(err){
                 load.close();
                 vm.$message.error("删除失败");
             })
         })
       },
       //搜索按钮回调事件
       searchChange:function(){
           var load = this.$loading({text:"查询中..."});
           this.pager.currentPage = 1;
           this.loadMatterLog(function(){
               load.close();
           },function(){
               vm.$message.success("查询成功")
           },function(){
               vm.$message.error("查询失败")
           });
       },
       //刷新按钮
       refreshChange:function(){
           var load = this.$loading({text:"刷新中..."});
           this.loadMatterLog(function(){
               load.close();
           },function(){
               vm.$message.success("刷新成功")
           },function(){
               vm.$message.error("刷新失败")
           });
       },
       //分页显示条数改变时回调
       sizeChange:function(size){
           this.pager.pageSize = size;
           this.loadMatterLog();
       },
       //分页改变页数时回调
       currentChange:function(page){
            this.pager.currentPage = page;
            this.loadMatterLog();
       },
       //加载重要日志
       loadMatterLog:function(fn,success,error){
           this.loading = true;
           $.ajax({
               url: "/log/matter/list?page=" + this.pager.currentPage + "&size=" + this.pager.pageSize,
               type:"POST",
               data: JSON.stringify(this.search),
               dataType:"JSON",
               contentType:"application/json;charset=utf-8",
               success:function(res){
                   if(res.code == 200){
                       var d = res.data;
                       vm.pager.total = res.count;
                       vm.data = d;
                       if(success){
                           success();
                       }
                   }else{
                       if(error){
                           error();
                       }
                   }
                   if(fn){
                       fn();
                   }
                   vm.loading = false;
               },
               error:function(err){
                   if(fn){
                       fn();
                   }
                   if(error){
                       error();
                   }
                   vm.loading = false;
               }
           });
       }
   },
   mounted:function(){
       this.loadMatterLog();
   }
});