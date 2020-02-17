// budget controller
var budgetController = (function() {
  // some code
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };
  Expense.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };
  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };
  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };
  var calculateTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(cur => {
      sum += cur.value;
    });
    data.total[type] = sum;
  };
  var data = {
    allItems: {
      expense: [],
      income: []
    },
    total: {
      expense: 0,
      income: 0
    },
    budget: 0,
    percentage: 0
  };

  return {
    addItem: function(type, descript, val) {
      var newItem, ID;
      // create new id
      if (data.allItems[type].length >= 1) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }
      // create new item based on income or expense type
      if (type === "expense") {
        newItem = new Expense(ID, descript, val);
      } else {
        newItem = new Income(ID, descript, val);
      }
      // pu it into data structure
      data.allItems[type].push(newItem);
      // return new element
      return newItem;
    },

    calculateBudget: function() {
      // calculate total income and expenses
      calculateTotal("expense");
      calculateTotal("income");
      // calculate the budget income - expenses
      data.budget = data.total.income - data.total.expense;
      // calculate the percentage of income that we spent
      if (data.total.income > 0) {
        data.percentage = Math.round(
          (data.total.expense / data.total.income) * 100
        );
      } else {
        data.percentage = -1;
      }
    },
    calculatePercentages: function() {
      data.allItems.expense.forEach(cur =>
        cur.calcPercentage(data.total.income)
      );
    },
    getPercentages: function() {
      var allPercentages = data.allItems.expense.map(cur =>
        cur.getPercentage()
      );
      return allPercentages;
    },
    getBudget: function() {
      return {
        budget: data.budget,
        income: data.total.income,
        expense: data.total.expense,
        percentage: data.percentage
      };
    },
    deleteItem: function(type, id) {
      var ids, index;
      ids = data.allItems[type].map(cur => cur.id);
      index = ids.indexOf(id);
      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },
    testTing: function() {
      console.log(data);
    }
  };
})();

// UIController
var UIController = (function() {
  // some code here
  var DOMstring = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expenseContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expenseLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    itemPercentageLabel: ".item__percentage",
    dateLabel: ".budget__title--month"
  };
  var formatNumber = function(num, type) {
    var numSplit, int, dec;
    num = Math.abs(num);
    num = num.toFixed(2);
    numSplit = num.split(".");
    int = numSplit[0];
    dec = numSplit[1];
    if (int.length > 3) {
      int =
        int.substr(0, int.length - 3) +
        "," +
        int.substr(int.length - 3, int.length);
    }
    return (type === "expense" ? "-" : "+") + int + "." + dec;
  };
  var nodeListForEach = function(list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };
  return {
    getInput: function() {
      return {
        //will be either income or expense
        type: document.querySelector(DOMstring.inputType).value,
        description: document.querySelector(DOMstring.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstring.inputValue).value)
      };
    },
    addToListItems: function(obj, type) {
      // create HTML string with place holder text
      var htmlItem, element, html;
      if (type === "income") {
        element = DOMstring.incomeContainer;
        html =
          '<div class="item" id="income-%id%"><div class="item__description">%description%</div><div class="right"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="far fa-times-circle fa-2x"></i></button></div></div></div>';
      } else {
        element = DOMstring.expenseContainer;
        html =
          '<div class="item" id="expense-%id%"><div class="item__description">%description%</div><div class="right"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="far fa-times-circle fa-2x"></i></button></div></div></div>';
      }
      // replace holder text with actual data
      htmlItem = html.replace("%id%", obj.id);
      htmlItem = htmlItem.replace("%description%", obj.description);
      htmlItem = htmlItem.replace("%value%", formatNumber(obj.value, type));
      // insert HTML into the DOM
      document.querySelector(element).insertAdjacentHTML("beforeend", htmlItem);
    },
    getDOMstring: function() {
      return DOMstring;
    },

    clearInputFields: function() {
      var fields, fieldsArr;
      fields = document.querySelectorAll(
        DOMstring.inputDescription + ", " + DOMstring.inputValue
      );
      fieldsArr = Array.prototype.slice.call(fields);
      fieldsArr.forEach(field => {
        field.value = "";
      });
      fieldsArr[0].focus();
    },
    displayBudget: function(obj) {
      var type;
      obj.budget > 0 ? (type = "income") : (type = "expense");
      document.querySelector(DOMstring.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(DOMstring.incomeLabel).textContent = formatNumber(
        obj.income,
        "income"
      );
      document.querySelector(DOMstring.expenseLabel).textContent = formatNumber(
        obj.expense,
        "expense"
      );
      if (obj.percentage === -1 || obj.percentage === 0) {
        document.querySelector(DOMstring.percentageLabel).textContent = "---";
      } else {
        document.querySelector(DOMstring.percentageLabel).textContent =
          obj.percentage + "%";
      }
    },
    displayPercentages: function(percentages) {
      var fields = document.querySelectorAll(DOMstring.itemPercentageLabel);
      var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
          callback(list[i], i);
        }
      };
      nodeListForEach(fields, function(current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + "%";
        } else {
          current.textContent = "---";
        }
      });
    },
    deleteItem: function(selectorID) {
      var element = document.getElementById(selectorID);
      element.parentElement.removeChild(element);
    },
    displayMonth: function() {
      var now, year, month;
      var months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ];
      now = new Date();
      month = now.getMonth();
      year = now.getFullYear();
      document.querySelector(DOMstring.dateLabel).textContent =
        months[month - 1] + " - " + year;
    },
    changeTyped: function() {
      var fields = document.querySelectorAll(
        DOMstring.inputType +
          "," +
          DOMstring.inputDescription +
          "," +
          DOMstring.inputValue
      );
      nodeListForEach(fields, function(cur) {
        cur.classList.toggle("red-focus");
      });
      document.querySelector(DOMstring.inputBtn + ' i').classList.toggle('red');
    }
  };
})();

// global app controller
var controller = (function(budgetCtrl, UICtrl) {
  // set up eventListener
  var setUpEventListeners = function() {
    var DOM = UICtrl.getDOMstring();
    document.querySelector(".add__btn").addEventListener("click", ctrlAddItem);
    document.addEventListener("keypress", event => {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });
    document
      .querySelector(DOM.container)
      .addEventListener("click", CrtlDeleteItem);
    document
      .querySelector(DOM.inputType)
      .addEventListener("change", UICtrl.changeTyped);
  };
  var updateBudget = function() {
    // calculate budget
    budgetCtrl.calculateBudget();
    // return the budget
    var budgets = budgetCtrl.getBudget();
    // display the budget on UI
    UICtrl.displayBudget(budgets);
  };
  var updatePercentage = function() {
    // calculate percentages
    budgetCtrl.calculatePercentages();
    // read percentages from the budget controller
    var percentages = budgetCtrl.getPercentages();
    // update the UI with the new percentages
    UICtrl.displayPercentages(percentages);
  };
  var ctrlAddItem = function() {
    var input, newItem;
    // get input fields
    input = UICtrl.getInput();
    // add items to budget controller
    newItem = budgetCtrl.addItem(input.type, input.description, input.value);
    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      // add item to the UI
      UICtrl.addToListItems(newItem, input.type);
      // clear input fields
      UICtrl.clearInputFields();
      // calculate and Update the budget
      updateBudget();
      // update & show percentage
      updatePercentage();
    }
  };
  var CrtlDeleteItem = function(event) {
    var splitID, type, id;
    var itemID =
      event.target.parentElement.parentElement.parentElement.parentElement.id;
    if (itemID) {
      splitID = itemID.split("-");
      type = splitID[0];
      id = parseInt(splitID[1]);
      // delete the item from the data structure
      budgetCtrl.deleteItem(type, id);
      // delete the item from the UI
      UICtrl.deleteItem(itemID);
      // update and show the new budget
      updateBudget();
      // update and show percentage
      updatePercentage();
    }
  };
  return {
    init: function() {
      console.log("Application has started");
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        income: 0,
        expense: 0,
        percentage: 0
      });
      setUpEventListeners();
    }
  };
})(budgetController, UIController);
controller.init();
