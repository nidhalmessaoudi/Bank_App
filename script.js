"use strict";

const account1 = {
  owner: "account1 Owner Name",
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    "2019-11-18T21:31:17.178Z",
    "2019-12-23T07:42:02.383Z",
    "2020-01-28T09:15:04.904Z",
    "2021-03-11T10:17:24.185Z",
    "2021-01-08T14:11:59.604Z",
    "2020-05-27T17:01:17.194Z",
    "2021-03-09T23:36:17.929Z",
    "2021-03-12T10:51:36.790Z",
  ],
  currency: "DT",
  locale: "AR-TN"
};

const account2 = {
  owner: "Account2 Owner Name",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    "2019-11-01T13:15:33.035Z",
    "2019-11-30T09:48:16.867Z",
    "2019-12-25T06:04:23.907Z",
    "2020-01-25T14:18:46.235Z",
    "2020-02-05T16:33:06.386Z",
    "2020-04-10T14:43:26.374Z",
    "2020-06-25T18:49:59.371Z",
    "2020-07-26T12:01:20.894Z",
  ],
  currency: "USD",
  locale: "en-US",
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

// LOCALE FROM BROWSER
const locale = navigator.language;

const formatMovementDate = function (date) {

  const calcDaysPassed = (date1, date2) => Math.round(Math.abs((date2 - date1) / (1000 * 60 * 60 * 24)));
  const daysPassed = calcDaysPassed(new Date(), date);
  console.log(daysPassed);
  if (daysPassed === 0) return "Today";
  if (daysPassed === 1) return "Yesterday";
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  return new Intl.DateTimeFormat(locale).format(date);
}

const formatCurrency = function (value) {
  return  new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
  }).format(value);
}

const startLogOutTimer = function () {
  const tick = () => {

    const min = String(Math.trunc(time / 60)).padStart(2, "0");
    const sec = String(time % 60).padStart(2, "0");
    labelTimer.textContent = `${min}:${sec}`;

    if (time === 0) {
      // STOP TIMER
      clearInterval(timer);

      // HIDE UI
      labelWelcome.textContent = `Log in to get started!`;
      containerApp.style.opacity = "0";
    }

    time--;

  }

  let time = 60;

  tick();
  const timer = setInterval(tick, 1000);

  return timer;

}

// SORT
let sortState = false;

const displayMovements = function (acc, sort) {

  containerMovements.innerHTML = "";

  const movs = sort ? acc.movements.slice().sort((a, b) => a - b) : acc.movements;

  movs.forEach(function (mov, i) {

    const type = mov > 0 ? "deposit" : "withdrawal";

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formatCurrency(mov)}</div>
      </div>
    `
    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
}


const calcDisplayBalance = function(acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc += mov, 0);
  labelBalance.textContent = `${formatCurrency(acc.balance)}`;
}


const calcDisplaySummary = function (acc) {
  const incomes = acc.movements.filter(mov => mov > 0).reduce((acc, mov) => acc + mov, 0);
  const outcomes = acc.movements.filter(mov => mov < 0).reduce((acc, mov) => acc + mov, 0);
  const interest = acc.movements.filter(mov => mov > 0).map(deposit => deposit * acc.interestRate / 100).filter(int => int >= 1).reduce((acc,int) => acc + int);
  labelSumIn.textContent = `${formatCurrency(incomes)}`;
  labelSumOut.textContent = `${formatCurrency(outcomes)}`;
  labelSumInterest.textContent = `${formatCurrency(interest)}`;
}

const updateUI = function (acc) {
  // DISPLAY MOVEMENTS
  displayMovements(acc);

  // DISPLAY BALANCE
  calcDisplayBalance(acc);

  // DISPLAY SUMMARY
  calcDisplaySummary(acc);
}

const computeUsernames = function (acc) {

  acc.forEach(account => {
    account.username = account.owner.toLowerCase().split(" ").map(word => word[0]).join("");
  });

}

computeUsernames(accounts);

// EVENT HANDLERS
let currentAccount, timer;

btnLogin.addEventListener("click", (e) => {
  e.preventDefault();
  currentAccount = accounts.find((acc) => acc.username === inputLoginUsername.value);
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // DISPLAY UI AND MESSAGE
    labelWelcome.textContent = `Good afternoon, ${currentAccount.owner.split(" ")[0]}!`;
    containerApp.style.opacity = "1";

    const now = new Date();
    const intlOptions = {
      hour: "numeric",
      minute: "numeric",
      day: "numeric",
      month: "long",
      year: "numeric",
      weekday: "long"
    }

    labelDate.textContent = new Intl.DateTimeFormat(locale, intlOptions).format(now);

    // CLEAR LOGIN INPUTS
    inputLoginUsername.value = inputLoginPin.value = "";
    inputLoginPin.blur();

    // UPDATE UI
    updateUI(currentAccount);

    // START LOGOUT TIMER
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();
  }

});

btnTransfer.addEventListener("click", (e) => {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find((acc) => acc.username === inputTransferTo.value);

  // CLEAR INPUTS
  inputTransferTo.value = inputTransferAmount.value = "";
  inputTransferAmount.blur();

  // DOING THE TRANSFER
  if (amount > 0 && currentAccount.balance >= amount && receiverAcc && receiverAcc.username !== currentAccount.username) {
    // ADD TRANSFER
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // ADD TRANSFER DATE
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);

    // CLEAR INTERVAL
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

btnLoan.addEventListener("click", e => {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(deposit => deposit >= amount * 0.1)) {
    setTimeout(function () {
        // ADD MOVEMENT
        currentAccount.movements.push(amount);

        // ADD MOVEMENT DATE
        currentAccount.movementsDates.push(new Date().toISOString());

        // CLEAR INPUTS
        inputLoanAmount.value = '';
        inputLoanAmount.blur();

        // UPDATE UI
        updateUI(currentAccount);

        // CLEAR INTERVAL
        clearInterval(timer);
        timer = startLogOutTimer();
      }, 2500)
  }
});

btnClose.addEventListener("click", e => {
  e.preventDefault();

  if (inputCloseUsername.value === currentAccount.username && Number(inputClosePin.value) === currentAccount.pin) {
    // CLOSE ACCOUNT
    const accIndex = accounts.findIndex((acc) => acc.username === currentAccount.username);
    accounts.splice(accIndex, 1);

    // UPDATE UI
    labelWelcome.textContent = `Log in to get started`;
    containerApp.style.opacity = "0";
  }
});

btnSort.addEventListener("click", e => {
  e.preventDefault();
  sortState = sortState === false;
  displayMovements(currentAccount, sortState);
});
