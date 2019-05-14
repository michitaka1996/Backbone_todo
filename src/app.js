var Backbone = require('../node_modules/backbone/backbone');
var $ = require('../node_modules/jquery/dist/jquery');
var _ = require('../node_modules/underscore/underscore');



//タスクアイテムmodel
//個々のmodel
var Item = Backbone.Model.extend({
    defaults: {
        text: '',
        editMode: false,
        isDone: false
    }
});
var item = new Item({ text: 'サンプル1' });
console.log('アイテム', item);


var Form = Backbone.Model.extend({
    defaults: {
        val: '',
        hasError: false,
        errorMsg: ''
    }
});
var form = new Form();














//タスクアイテムview　1個1個
var ItemView = Backbone.View.extend({
    template: _.template($('#template-list-item').html()),
    events: {
        "click .js-done": "taskDone",
        "click .js-list-edit": "startEdit",
        "click .js-click-trash": "taskRemove",
        "keyup .js-listEdit-done": "closeEdit"
    },
    initialize: function (options) {
        _.bindAll(this, 'render', 'update', 'taskDone', 'startEdit', 'taskRemove', 'closeEdit'),
            this.model.bind("change", this.render),
            this.model.bind("destroy", this.remove),
            this.render()
    },
    update: function (text) {
        this.model.set({ text: text });
    },
    taskDone: function () {
        //タスク完了
         //isDoneをtureにして背景色を変更
        console.log('タスク完了がクリックされました');
        this.model.set({ isDone: !this.model.get('isDone') });
    },
    startEdit: function () {
        //タスク編集開始
        console.log('タスク編集がクリックされました');
        this.model.set({ editMode: true });
    },
    closeEdit: function (e) {
        //タスク編集終了
        this.model.set({ editMode: true });
        if (e.keyCode === 13 && e.shiftKey === true) {
            console.log('エンタークリックされました');
            this.model.set({ text: e.currentTarget.value, editMode: false });
        }
    },
    taskRemove: function () {
        $(this.el).remove();
        return this;
    },
    render: function () {
        //templateプロパティにアクセス
        // var compiled = _.template($('#template-list-item').html());
        // $(this.el).html(compiled(this.model.attributes));
        // return this;
        var template = this.template(this.model.attributes);
        this.$el.html(template);
        //処理を終了f
        return this;
    }
}); 
//elは最後に渡す方法
var itemView = new ItemView({ el: $('.js-todo_list'), model: item });






















//Collection
//複数のmodelを扱う MVCのCではない
//https://qiita.com/yuku_t/items/c19d2fff0dc23e4015ff
var SOME = Backbone.Collection.extend({
    model: Item
});

// インスタンス生成時にモデルを渡すことで初期化することが可能です。渡すのは Model インスタンスでも、単なるオブジェクトでも構いません。
var item2 = new Item({ text: 'item2' });
var item3 = new Item({ text: 'item3' });

//modelのデータを渡したCollectionインスタンス
var some = new SOME([item2, item3]);

console.log('コレクション', some);





















//複数のモデルを扱うためのビュー
 //collectionで使えるメソッド
　//https://www.buildinsider.net/web/bookjslib111/88
var SomeItem = Backbone.View.extend({
    el: $('.js-todo_list'),
    //どのコレクションを引き継ぐのか
    collection: some,
    initialize: function () {
        _.bindAll(this, 'render', 'addItem', 'appendItem'),
            this.collection.bind('add', this.appendItem),
            this.render()
    },
    addItem: function (text) {
        //モデルを作成
        var model = new Item({ text: text });
        //collectionに引数で入力されたtextを元につくったmodelを追加
        this.collection.add(model)
    },
    appendItem: function (model) {
        //ビューを作成
        //addItemで作ったmodelをもとに
        var itemView = new ItemView({ model: model });  
        //テンプレートを使うために1個1個のビューを使うこと
        this.$el.append(itemView.render().el);
        console.log('要素', itemView.render().el);
    },
    render: function () {
        //renderはDOM操作
        //1個1個ビューの中のtemplateを使う
        var that = this;
        //h紐づいているlistのビューをeachしているmodel i
        this.collection.each(function (model, i) {
            that.appendItem(model); 
        });
        return this;
    }
});
var someItem = new SomeItem({ collection: some });













//タスク追加ビュー
var FormView = Backbone.View.extend({
    el: $('.js-add-todo'),
    model: form,
    template: _.template($('#template-add-item').html()),
    events: {
        "click .js-add-btn": "addTodo"
    },
    initialize: function () {
        _.bindAll(this, 'render', 'addTodo'),
            this.model.bind("change", this.render),
            this.render()
    },
    addTodo: function (e) {
        console.log('タスク追加がクリックされました');
        e.preventDefault();

        var textVal = $('.js-add-text').val();
        console.log('テキストレングス', textVal);
        if (!textVal) {
            this.model.set({hasError: true})
        } else {
            this.model.set({ val: textVal, hasError: false });
            someItem.addItem(this.model.get('val'))   
        }
    },
    render: function () {
        var template = this.template(this.model.attributes);
        this.$el.html(template)
        return this;
    }
});
new FormView();