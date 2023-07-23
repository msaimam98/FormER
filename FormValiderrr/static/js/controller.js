// ERRORS: Q1: POST request was not going through, had to pass in data: JSON.Stringify(data1)
// ERRORS: Q2: item names with '-' are being passed in --> item name must be alphanumeric and with spaces only 
// ERRORS: Q3: the 2 tests need to scroll down, I scrolled down using --> driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")

// NOTES FROM LECTURE 
// need the errors to show up the moment we start typing something in the fields except for username - which should be checked at the end 
// two ajax requests -> one in part1 and one in part3 
// the ajax request here is in regards to the submit button 
const print = console.log
let items = [];
let globalParaNumber = 1;
let done = false;

$(document).ready(function () {

    // PART 1 --> validates everything at the end 
    $("#register").click(function() {
        
        if (validate_form() === true) {

            // send an ajax request 
            var username = $("#username").val().trim()
            var email = $("#email").val().trim()
            print('This is the phone number', $("#phone").val())
            var phone = $("#phone").val().trim()
            var password = $("#password1").val().trim()
            var password2 = $("#password2").val().trim()
            data1 = {
                'username': username,
                'email': email, 
                'phone': phone,
                'password1': password,
                'password2': password2
            }

            $.ajax({
                url: '/register',
                type: 'POST',
                data: JSON.stringify(data1),
                contentType: 'application/json',
                success: function() {
                  // handle the response data
                  print('atleast I am coming here')
                  $("#notification").text("User added");
                },

                // jqXHR: an object whose .status is equal to the response code
                // textStatus: type of error --> examples: "timeout", "error", "abort", and "parsererror"
                // errorThrown: text part of the error --> When an HTTP error occurs, errorThrown receives the textual portion of the HTTP status, such as "Not Found" or "Internal Server Error."
                error: function(jqXHR, textStatus, errorThrown) {
                    print(jqXHR.status, 'jqXHR.status')
                    print(textStatus, 'textStatus')
                    print(errorThrown, 'errorThrown')

                    // handle the error response
                    if (jqXHR.status === 400) {
                        $('#notification').text('Unknown error occurred');
                    } else if (jqXHR.status === 409) {
                        $('#username_notification').text('Username has already been taken');
                        $('#notification').text(' ');

                    }
                }
            })
        }
        else {
                $("#notification").text("At least one field is invalid. Please correct it before proceeding");
        }

    });
    
    // validate_username() will give a return value that will be passed into the onChange attribute of the tag
    // validate_username will just register as the function to use when something is changed in element tag
    $("#username").on("input", validate_username);
    $("#email").on("input", validate_email);
    $("#phone").on("input", validate_phone);
    $("#password1").on("input", validate_password).on("input", validate_passwords); // although there is chaining here, note that the order matters and that BOTH of them will be executed when something changes in this field
    $("#password2").on("input", validate_passwords);



    // PART 2
    $("#add_update_item").click(function() {
        // print("reaching till line 87");

        if (validateFormAmazon() === false) {

            // Validate all fields again when the button has been pressed - if not print error 
            $("#item_notification").text("Name, price, or quantity is invalid");
        }
        else {
            // remove the error message since everything is fine now
            $("#item_notification").text("");

            // get the values from the filled out html 
            var name = $("#name").val().trim(); // not underscored 
            var price = parseFloat($("#price").val().trim());
            var quantity = parseInt($("#quantity").val().trim());

            var item = new Item(name, price, quantity);

            if (items.length === 0) {

                items.push(item);

                addRow(name, price, quantity);

                var difference = price*quantity;
                updateSubtotals(difference);
                
            }
            else {

                // check if this new item is already in items list - need to update
                if (itemInThere(name)) {

                    var underscoredName = name.replace(/\s+/g, "_")

                    // name: must be underscored, price: must be float, quantity: must not be string 
                    item = itemInThere(name);

                    updateRow(underscoredName, price, quantity);

                    // if newtotal - oldtotal < 0, subtract from subtotal
                    var difference = price*quantity - item.total;
                    updateSubtotals(difference);
                }
                else {

                    items.push(item);

                    addRow(name, price, quantity);
                    
                    var difference = price*quantity;
                    updateSubtotals(difference);
                }
            }
        }

    })

    // PART 3
    getParas()
    $(window).scroll(function() {
        var currentHeight = Math.ceil($(window).scrollTop() + $(window).height()); // current position in the height
        var totalHeight = $(document).height(); // total height of the page at that point 

        if(currentHeight >= totalHeight) { // if current position > total, we have reached the end of the page 
            getParas();   
        }
    });


})

// PART 3 

function getParas() {


    if (done) { return; } // done represents the end of anymore content
    $.ajax({
        url: '/text/data?paragraph=' + ((globalParaNumber - 1) * 5 + 1),
        type: 'GET',
        success: function(response) {

            createParagraphs(response); // on success, create the paragraphs

            if (!response.next) {
                var dataDiv = $('#data');
                $('<div>').html('<b>You have reached the end.</b>').appendTo(dataDiv);
                done = true;
            }
            else {
                globalParaNumber++; // this means there is more content to print, incrementing it gives us the next iteration of content
            }
        },
        error: function() {
            console.log('Error fetching data');
        }
    });
}

function createParagraphs(response) {

    var dataDiv = $('#data');
    var actualData = response.data;

    for (var l = 0; l < actualData.length; l++) {

        var paragraphNumber35 = actualData[l].paragraph;
        var content = actualData[l].content;
        var likes = actualData[l].likes;
        
        // add the para
        let paraID3 = 'paragraph_' + paragraphNumber35;
        var newPara = $('<div>').attr('id', 'paragraph_' + paragraphNumber35);
        newPara.appendTo(dataDiv);

        // add the content of the para
        var paraContent = $('<p>');
        paraContent.text(content + ' ');
        paraContent.appendTo(newPara);

        // add the paragraph identifier at the end of the p tag 
        var paraIdentifier = $('<b>').text('(Paragraph: ' + paragraphNumber35 + ')');
        paraIdentifier.appendTo(paraContent);

        // add like button 
        var likeButton = $('<button>');
        likeButton.addClass('like').text('Likes: ' + likes);
        likeButton.appendTo(newPara);
        likeButton.click(function() {
            incrementLikes(paraID3);
        });
    }
}
function incrementLikes(paraID) {
    // Here --> paraNumber is actual paragraph number 

    var paraID2 = '#' + paraID;
    var likeButton2 = $(paraID2).children().eq(1)[0];

    var extractedNumber = 0;
    if (paraID.length === 11) {
        extractedNumber = paraID.slice(-1);
    }
    else {
        extractedNumber = paraID.slice(-2);
    }

    $.ajax({
        url: '/text/like',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ paragraph: extractedNumber }),
        success: function(response) {
          likeButton2.innerText = 'Likes: ' + response.data.likes;
        },
        error: function() {
          console.log('Error liking paragraph ' + extractedNumber);
        }
      });

}

// PART 2 
function updateSubtotals(difference) {

    var subtotal = $("#subtotal");
    var taxes = $("#taxes");
    var grandTotal = $("#grand_total");

    // difference is a int, second one is float
    var newSubtotal = parseFloat(subtotal.text()) + difference
    subtotal.text(newSubtotal.toFixed(2));


    var newTaxes = newSubtotal*0.13;
    // $("#taxes") returns a list so if I want to use innerText which is a js attribute with this jquery object, I need to select the item within the list
    // which happens to be just the first element 
    taxes[0].innerText = newTaxes.toFixed(2);

    var newGrandTotal = newTaxes + newSubtotal;
    grandTotal[0].innerText = newGrandTotal.toFixed(2); 

}

function itemInThere(name) {
    for (var i = 0; i < items.length; i++) {
        if (items[i].name === name) {
            return items[i];
        }
    }
    return false;
}

function updateRow(underscoredName3, price3, quantity3) {
    var rowName = "#" + underscoredName3;
    var row = $(rowName);

    var price = row.children().eq(1);
    var quantity = row.children().eq(2);
    var total = row.children().eq(3);

    price[0].innerText = "$" + price3.toFixed(2);
    quantity[0].innerText = quantity3.toFixed(2);
    var totalFloat = price3*quantity3;
    total[0].innerText = "$" + totalFloat.toFixed(2);
}

function subtractButton2(underscoredName) {

    // convert the underscored version of the name to normal
    var originalName2 = underscoredName.replace(/_/g, " ");

    // find the item with this name
    for (var i = 0; i < items.length; i++) {
        if (items[i].name === originalName2) {
            if (items[i].quantity > 0) {
                items[i].quantity = items[i].quantity - 1;
                // name: underscore version of the name, price: float, quantity: int
                updateRow(underscoredName, items[i].price, items[i].quantity);

                var difference = items[i].price - 2*items[i].price;
                updateSubtotals(difference);
            }
        }
    }
}

function addButton2(underscoredName) {

    // convert the underscored version of the name to normal
    var originalName2 = underscoredName.replace(/_/g, " ");

    // find the item with this name
    for (var i = 0; i < items.length; i++) {
        if (items[i].name === originalName2) {
            if (items[i].quantity >= 0) {
                items[i].quantity = items[i].quantity + 1;
                // name: underscore version of the name, price: float, quantity: int
                updateRow(underscoredName, items[i].price, items[i].quantity);

                var difference = items[i].price;
                updateSubtotals(difference);
            }
        }
    }
}

function deleteButton2(underscoredName) {
    var rowName = "#" + underscoredName;
    var row = $(rowName);

    // removes the whole row 
    row.remove();
    var originalName = underscoredName.replace(/_/g, " ");

    // update the subtotals before I delete the item
    item = itemInThere(originalName);
    
    var total = item.price*item.quantity // this is to make the totals value negative
    difference = total - 2*total;
    updateSubtotals(difference);

    for (let j = 0; j < items.length; j++) {
        if (items[j].name === originalName) {
            if (j === 0) {
                items.splice(j, j+1);
                
            }
            else {
                items.splice(j,j);
            }
        }
    }
}

function addRow(name2, price2, quantity2) {

    var body = $('#cart-items tbody');
    var newRow = $("<tr>").attr("id", name2.replace(/\s+/g, "_")); // new_id is the second param of attr (new_id is the id name)
    newRow.appendTo(body);

    var nameCell = $("<td>").text(name2);
    nameCell.appendTo(newRow);
    
    var fullPrice = "$" + price2.toFixed(2);
    var priceCell = $("<td>").text(fullPrice);
    priceCell.appendTo(newRow);

    var quantityCell = $("<td>").text(quantity2);
    quantityCell.appendTo(newRow);
    
    var total = price2*quantity2;
    var fullTotal = "$" + total.toFixed(2);
    var totalCell = $("<td>").text(fullTotal);
    totalCell.appendTo(newRow);

    var decreaseCell = $("<td>");
    decreaseCell.appendTo(newRow);
    var decreaseButton = $("<button>").addClass("btn decrease").text("-")
    decreaseButton.appendTo(decreaseCell);

    var increaseCell = $("<td>");
    increaseCell.appendTo(newRow);
    var increaseButton = $("<button>").addClass("btn increase").text("+");
    increaseButton.appendTo(increaseCell);

    var deleteCell = $("<td>");
    deleteCell.appendTo(newRow);
    var deleteButton = $("<button>").addClass("btn delete").text("delete");
    deleteButton.appendTo(deleteCell);


    // now set the click attr to deleteButton, increaseButton, or decreaseButton function 
    deleteButton.click(function() {
        deleteButton2(newRow.attr("id"));
    });
    increaseButton.click(function() {
        addButton2(newRow.attr("id"));
    })
    decreaseButton.click(function() {
        subtractButton2(newRow.attr("id"));

    })

}


// validating the items
function validateFormAmazon() {
    submitError = $("#item-notification")
    var is_valid = true;

    // if any one of the validate functions return false, all of them will return false
    is_valid = validateNameAmazon() && is_valid;
    is_valid = validatePriceAmazon() && is_valid;
    is_valid = validateQuantityAmazon() && is_valid;
    print('validateNameAmazon', validateNameAmazon())
    print('validatePriceAmazon', validatePriceAmazon())
    print('validateQuantityAmazon', validateQuantityAmazon())

    if (is_valid) {
        submitError.text("");
        return true;
    }
    return false;
}

function validateNameAmazon() {
    var name = $("#name").val().trim();
    // var regex = /^[a-zA-Z0-9 ]*$/;
    var regex = /^[a-zA-Z0-9 -]*$/;

    if (regex.test(name)) {
        return true;
    }
    return false;
}

function validatePriceAmazon() {
    var price = $("#price").val().trim();
    var floatPrice = parseFloat(price);

    if (isNaN(floatPrice) || floatPrice < 0 ) {
        return false;
    }
    return true;
}

function validateQuantityAmazon() {
    var quantity = $("#quantity").val().trim();
    var intQuantity = parseInt(quantity);

    // only isNaN when e or e1324 is sent -- only < 0 when a negative number is sent in 
    if (isNaN(intQuantity) || intQuantity < 0) {
        return false;
    }
    return true;
}


// PART 1
function validate_form() {
    submitError = $("notification")
    var is_valid = true;

    // if any one of the validate functions return false, all of them will return false
    // is_valid will be false 
    // print(is_valid, 'this is before validate_username')
    is_valid = validate_username() && is_valid;
    // print(is_valid, 'this is after validate_username');
    is_valid = validate_email() && is_valid;
    // print(is_valid, 'this is after validate_email')
    is_valid = validate_phone() && is_valid;
    // print(is_valid, 'this is after validate_phone')
    is_valid = validate_password() && is_valid;
    // print(is_valid, 'this is after validate_password')
    is_valid = validate_passwords() && is_valid;
    // print(is_valid, 'this is after validate_passwords')
    
    if (is_valid) {
        submitError.text("");
        return true;
    }
    return false;

}


// Check if the username is more than 0 (non-empty), has only letters, digits, and underscores  
function validate_username() {
    var usernameTag = $("#username");
    var error = $("#username_notification");
    var username = usernameTag.val().trim();
    var regex = /^[a-zA-Z0-9_]{6,}$/;
    // trim takes the white spaces off 
    if ( username.length > 0 && regex.test(username) ) {
        usernameTag.css("background-color", "lightcyan");
        error.text(" ");
        return true;
    }
    else {
        // print("In the valid_username");
        usernameTag.css("background-color", "red");
        // this will not parse the code as if it is HTML (just as text)
        error.text("Username is invalid")
        return false;
    }
}


// Check if the password has at least eight characters long, and includes at least one digit, one lowercase letter, one uppercase letter, and one sign 
// error message: Password is invalid
function validate_password() {
    var passwordTag = $("#password1");
    var error = $("#password1_notification");
    var password = passwordTag.val().trim();
    var regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/


    // trim takes the white spaces off 
    if ( password.length > 7 && regex.test(password) ) {
        passwordTag.css("background-color", "lightcyan");
        error.text(" ");
        return true;
    }
    else {

        passwordTag.css("background-color", "red");
        // this will not parse the code as if it is HTML (just as text)
        error.text("Password is invalid")
        return false;
    }
}


// Check if the passwords are the same 
// error message: Passwords don't match
function validate_passwords() {
    var passwordTag = $("#password1");
    var password = passwordTag.val().trim();

    var password2Tag = $("#password2");
    var password2 = password2Tag.val().trim();

    // have to send this error to password2 field therefore error is to password2_notification 
    var error = $("#password2_notification");


    // trim takes the white spaces off 
    if ( password === password2 ) {
        password2Tag.css("background-color", "lightcyan");
        error.text(" ");
        return true;
    }
    else {
        // print("In the valid_passwords");
        // passwordTag.css("background-color", "red");
        password2Tag.css("background-color", "red");
        // this will not parse the code as if it is HTML (just as text)
        error.text("Passwords don't match")
        return false;
    }
}





// Check if the email is valid: has @, has .com --> I can find some regex that validates the email 
// error message: Email is invalid
function validate_email() {
    var emailTag = $("#email");
    var error = $("#email_notification");
    var email = emailTag.val().trim();
    // regex for email source: https://www.w3resource.com/javascript/form/email-validation.php
    var regex = /^(?!.*\.{2})[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
    print(regex.test(email), 'this means regex is not discounting .. in the email');
    // trim takes the white spaces off 
    if ( regex.test(email) ) {
        emailTag.css("background-color", "lightcyan");
        error.text(" ");
        return true;
    }
    else {
        // print("In the valid_email");
        emailTag.css("background-color", "red");
        // this will not parse the code as if it is HTML (just as text)
        error.text("Email is invalid")
        return false;
    }

}

// CHeck if the phone number is in this form: ???-???-???? --> develop some regex that makes sure each ? is a number 
// error message: Phone is invalid
function validate_phone() {
    var phoneTag = $("#phone");
    var error = $("#phone_notification");
    print('this is coming from validate_phone', phoneTag.val())
    var phone = phoneTag.val().trim();
    // var regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
    var regex = /^\d{3}-\d{3}-\d{4}$/


    // trim takes the white spaces off 
    if ( regex.test(phone) ) {
        phoneTag.css("background-color", "lightcyan");
        error.text(" ");
        return true;
    }
    else {
        // print("In the valid_phone");
        phoneTag.css("background-color", "red");
        // this will not parse the code as if it is HTML (just as text)
        error.text("Phone is invalid")
        return false;
    }
}






