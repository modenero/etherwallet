var PrivKey = "";
var decryptType = "";
$(document).ready(function() {
	bindElements();
    checkAndLoadPageHash();
    checkAndRedirectHTTPS();
});
function checkAndRedirectHTTPS(){
    var host = "myetherwallet.com";
    var githost = "kvhnuke.github.io";
    var githostw = "www.kvhnuke.github.io";
    var hostw = "www.myetherwallet.com";
    if ((host == window.location.host||
        githost == window.location.host||
        hostw == window.location.host||
        githostw == window.location.host) && (window.location.protocol != "https:"))
        window.location.protocol = "https";
}
function checkAndLoadPageHash(){
    if(window.location.hash) {
        var phash = window.location.hash.substr(1);
        $( ".ptabs" ).each(function( index ) {
            if($(this).attr('id')==phash){
                $(this).click();
                setTimeout(function(){
                    $('html,body').scrollTop(0);
                },50);
                return;
            }
        });
    }
}
function paneNavigate(showEleId, activeEleId){
    hideAllMainContainers();
    $("#"+showEleId).show();
    $("#"+activeEleId).parent().addClass('active');
    location.hash = activeEleId;
    $('html,body').scrollTop(0);
}
function bindElements() {
    $( ".ptabs" ).each(function( index ) {
        $(this).click(function(){
            paneNavigate($(this).attr('showId'), this.id);
        });
    });
    $("#privkeyenc,#address,#privkey").click(function() {
        this.focus();
		this.select();
	});
    $("#btndonate").click(function() {
		$("#sendtxaddress").val('0x7cb57b5a97eabe94205c07890be4c1ad31e486a8');
        $("#donateThanks").show();
        $("#sendtxaddress").trigger("keyup");
	});
	$("#generatewallet").click(function() {
		generateSingleWallet();
	});
	$("#btngeneratetranaction").click(function() {
		preCreateTransaction();
	});
	$("#printqr").click(function() {
		printQRcode();
	});
	$("#btnapprovesend").click(function() {
		preSendTransaction();
	});
	$("#bulkgenerate").click(function() {
		generateBulkWallets();
	});
	$("#decryptdata").click(function() {
		$("#decryptStatus").html('<p class="text-center text-info"><strong> Please Wait...</strong></p>').fadeIn(10);
		setTimeout(function() {
			decryptFormData();
		}, 100);
	});
	$('input[type=radio][name=typeOfKeyRadio]').change(function() {
		PrivKey = "";
		$('#fuploadStatus').empty();
		$('#walletfilepassword').val('');
		$('#privkeypassword').val('');
		$('.btn-file :file').val('');
		$('#manualprivkey').val('')
		$("#walletuploadbutton").hide();
		$("#walletPasdiv").hide();
		$("#divprikeypassword").hide();
		$("#wallettransactions").hide();
		if (this.value == 'fileupload') {
			$("#selectedTypeKey").hide();
			$("#selectedUploadKey").show();
			decryptType = "fupload";
		} else if (this.value == 'pasteprivkey') {
			$("#selectedUploadKey").hide();
			$("#selectedTypeKey").show();
			decryptType = "privkey";
		}
	});
	$('input[type=radio][name=currencyRadio]').change(function() {
		$("#sendtxamount").trigger("keyup");
	});
	$('#walletfilepassword').on('paste, keyup', function() {
		if ($('#walletfilepassword').val() != "") {
			$("#uploadbtntxt-wallet").show();
			$("#uploadbtntxt-privkey").hide();
			$("#walletuploadbutton").show();
		} else {
			$("#walletuploadbutton").hide();
		}
	});
	$('#sendtxamount').on('paste, keyup', function() {
		var amount = $('#sendtxamount').val();
		if ($('#sendtxamount').val() != "" && $.isNumeric(amount) && amount > 0) {
			var etherUnit = $('input[type=radio][name=currencyRadio]:checked').val();
			$("#weiamount").html('<p class="text-success"><strong>' + toWei(amount, etherUnit) + ' wei</strong></p>');
		} else if ($('#sendtxamount').val() != "" && !$.isNumeric(amount)) {
			$("#weiamount").html('<p class="text-danger"><strong>Invalid amount</strong></p>');
		} else {
			$("#weiamount").html('');
		}
	});
	$('#sendtxaddress').on('paste, keyup', function() {
		if (validateEtherAddress($('#sendtxaddress').val())) {
			$("#addressvalidate").html('<p class="text-success"><strong> Address is valid</strong></p>').fadeIn(50);
		} else if ($('#sendtxaddress').val() == "") {
			$("#addressvalidate").html('');
		} else {
			$("#addressvalidate").html('<p class="text-danger"><strong> Invalid address</strong></p>').fadeIn(50);
		}
	});
	$('#privkeypassword').on('paste, keyup', function() {
		if ($('#privkeypassword').val().length > 6) {
			$("#uploadbtntxt-wallet").hide();
			$("#uploadbtntxt-privkey").show();
			$("#walletuploadbutton").show();
		} else {
			$("#walletuploadbutton").hide();
		}
	});
	$('#manualprivkey').on('paste, keyup', function() {
		$("#divprikeypassword").hide();
		if ($('#manualprivkey').val().length == 128) {
			$("#divprikeypassword").show();
		} else if ($('#manualprivkey').val().length == 64) {
			$("#uploadbtntxt-wallet").hide();
			$("#uploadbtntxt-privkey").show();
			$("#walletuploadbutton").show();
		}
	});
	$('.btn-file :file').change(function() {
		if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
			alert('The File APIs are not fully supported in this browser. Please use a modern browser');
			return;
		}
		var input = $(this),
			numFiles = input.get(0).files ? input.get(0).files.length : 1,
			label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
		input.trigger('fileselect', [numFiles, label]);
	});
	$('.btn-file :file').on('fileselect', function(event, numFiles, label) {
		$('#fuploadStatus').empty();
		$('#walletfilepassword').val('')
		PrivKey = "";
		file = $('.btn-file :file')[0].files[0];
		var fr = new FileReader();
		fr.onload = function() {
			try {
				if (walletRequirePass(fr.result)) {
					$("#walletPasdiv").show();
					$("#walletuploadbutton").hide();
				} else {
					$("#walletPasdiv").hide();
					$("#walletuploadbutton").show();
					$("#uploadbtntxt-wallet").show();
					$("#uploadbtntxt-privkey").hide();
				}
			} catch (err) {
				$('#fuploadStatus').append('<p class="text-center text-danger"><strong> ' + err + '</strong></p>');
			}
		};
		fr.readAsText(file);
		var input = $(this).parents('.input-group').find(':text'),
			log = numFiles > 1 ? numFiles + ' files selected' : label;
		if (input.length) {
			input.val(log);
		} else {
			if (log) {
				$('#fuploadStatus').append('<p class="text-center text-success"><strong> File Selected: ' + log + '</strong></p>');
			}
		}
	});
}

function preSendTransaction() {
	sendTransaction($("#tasignedtx").val(), function(data) {
		$("#txsendstatus").html('<p class="text-center text-success"><strong> Transaction submitted. TX ID: ' + data + '</strong></p>');
	}, function(err) {
		$("#txsendstatus").html('<p class="text-center text-danger"><strong>' + err + '</strong></p>');
	});
	$('#sendTransaction').modal('hide');
}

function preCreateTransaction() {
	try {
		$("#tarawtx").val("");
		$("#tasignedtx").val("");
		$("#txsendstatus").html('')
		var toAddress = $('#sendtxaddress').val();
		if (PrivKey.length != 64) throw "Invalid Private key, try again";
		if (!validateEtherAddress(toAddress)) throw "Invalid to Address, try again";
		if (!$.isNumeric($('#sendtxamount').val()) || $('#sendtxamount').val() <= 0) throw "Invalid amount, try again";
		var etherUnit = $('input[type=radio][name=currencyRadio]:checked').val();
		var weiAmount = toWei($('#sendtxamount').val(), etherUnit);
		createTransaction(PrivKey, toAddress, weiAmount, function(data) {
			$("#tarawtx").val(data.raw);
			$("#tasignedtx").val(data.signed);
			$("#txcreatestatus").html('<p class="text-center text-success"><strong> Transaction generated</strong></p>').fadeIn(50);
			$("#divtransactionTAs").show();
			$("#divsendtranaction").show();
			$("#confirmAmount").html($('#sendtxamount').val());
			$("#confirmCurrancy").html(etherUnit);
			$("#confirmAddress").html(toAddress);
		}, function(err) {
			$("#txcreatestatus").html('<p class="text-center text-danger"><strong> ' + err + '</strong></p>').fadeIn(50).fadeOut(3000);
			$("#divtransactionTAs").hide();
			$("#divsendtranaction").hide();
		});
	} catch (err) {
		$("#txcreatestatus").html('<p class="text-center text-danger"><strong> ' + err + '</strong></p>').fadeIn(50).fadeOut(3000);
		$("#divtransactionTAs").hide();
		$("#divsendtranaction").hide();
	}
}

function decryptFormData() {
	PrivKey = "";
	if (decryptType == 'fupload') {
		file = $('.btn-file :file')[0].files[0];
		var fr = new FileReader();
		fr.onload = function() {
			try {
				PrivKey = getWalletFilePrivKey(fr.result, $('#walletfilepassword').val());
				$("#accountAddress").html(formatAddress(strPrivateKeyToAddress(PrivKey), 'hex'));
				getBalance($("#accountAddress").html(), function(result) {
					if (!result.error){ 
					   var bestCurAmount = getBestEtherKnownUnit(result.data.balance);  
					   $("#accountBalance").html(bestCurAmount.amount + " "+bestCurAmount.unit);
                    }
					else
					alert(result.msg);
				});
				$("#decryptStatus").html('<p class="text-center text-success"><strong> Wallet successfully decrypted</strong></p>').fadeIn(2000);
				$("#wallettransactions").show();
			} catch (err) {
				$("#decryptStatus").html('<p class="text-center text-danger"><strong> ' + err + '</strong></p>').fadeIn(50).fadeOut(3000);
				$("#wallettransactions").hide();
			}
		};
		fr.readAsText(file);
	} else if (decryptType == 'privkey') {
		try {
			PrivKey = decryptTxtPrivKey($('#manualprivkey').val(), $("#privkeypassword").val());
			$("#accountAddress").html(formatAddress(strPrivateKeyToAddress(PrivKey), 'hex'));
			getBalance($("#accountAddress").html(), function(result) {
				if (!result.error){ 
				    var bestCurAmount = getBestEtherKnownUnit(result.data.balance);  
	               $("#accountBalance").html(bestCurAmount.amount + " "+bestCurAmount.unit);
                }
				else
				alert(result.msg);
			});
			$("#decryptStatus").html('<p class="text-center text-success"><strong> Wallet successfully decrypted</strong></p>').fadeIn(2000);
			$("#wallettransactions").show();
		} catch (err) {
			$("#decryptStatus").html('<p class="text-center text-danger"><strong> Invalid password</strong></p>').fadeIn(50).fadeOut(3000);
			$("#wallettransactions").hide();
		}
	}
}

function hideAllMainContainers() {
	$("#paneWalgen").hide();
	$("#paneBulkgen").hide();
	$("#paneSendTrans").hide();
	$("#paneHelp").hide();
	$("#panePrint").hide();
	$("#bulk-generate").parent().removeClass('active');
	$("#generate-wallet").parent().removeClass('active');
	$("#send-transaction").parent().removeClass('active');
	$("#help").parent().removeClass('active');
}

function generateSingleWallet() {
	var password = $("#ethgenpassword").val();
	if (password == "") {
		alert("Please enter a password.");
		return;
	}
	if (password.length < 7) {
		alert("Your password must be at least 7 characters");
		return;
	}
	$("#generatedWallet").show();
	var acc = new Accounts();
	var newAccountEnc = acc.new(password);
	$("#address").val(newAccountEnc.address);
	var newAccountUnEnc = acc.get(newAccountEnc.address, password);
	$("#privkey").val(newAccountUnEnc.private);
	$("#privkeyenc").val(newAccountEnc.private);
	$("#qrcodeAdd").empty();
	new QRCode($("#qrcodeAdd")[0], {
		text: newAccountEnc.address,
		width: $("#qrcode").width(),
		height: $("#qrcode").width(),
		colorDark: "#000000",
		colorLight: "#ffffff",
		correctLevel: QRCode.CorrectLevel.H
	});
	$("#qrcode").empty();
	new QRCode($("#qrcode")[0], {
		text: newAccountUnEnc.private,
		width: $("#qrcode").width(),
		height: $("#qrcode").width(),
		colorDark: "#000000",
		colorLight: "#ffffff",
		correctLevel: QRCode.CorrectLevel.H
	});
	var fileType = "text/json;charset=UTF-8";
	var encblob = new Blob([JSON.stringify(newAccountEnc)], {
		type: fileType
	});
	var unencblob = new Blob([JSON.stringify(newAccountUnEnc)], {
		type: fileType
	});
	$("#encdownload").attr('href', window.URL.createObjectURL(encblob));
	$("#encdownload").attr('download', newAccountEnc.address + '-Encrypted.json');
	$("#unencdownload").attr('href', window.URL.createObjectURL(unencblob));
	$("#unencdownload").attr('download', newAccountEnc.address + '-Unencrypted.json');
	acc.clear();
}

function generateBulkWallets() {
	var password = $("#bulkgenpassword").val();
	var count = $("#numberwallets").val();
	if (count == "") {
		alert("Please enter the amount of wallets you want to generate.");
		return;
	} else if (count != parseInt(count, 10)) {
		alert("Digits only please");
		return;
	}
	var isencrypted = false;
	if (password != "" && password.length < 7) {
		alert("Your password must be at least 7 characters.");
		return;
	} else if (password != "" && password.length >= 7) {
		isencrypted = true;
	}
	if (isencrypted) $("#bulkIsEnc").html(" (Encrypted)")
	else
	$("#bulkIsEnc").html(" (Unencrypted)")
	$("#generatedbulkwallets").show();
	$('#bulkgentable tr:not(:first)').remove();
	var acc = new Accounts();
	var csv = "";
	var jsonarr = [];
	var txt = "";
	for (var i = 0; i < count; i++) {
		if (isencrypted) var newAccount = acc.new(password);
		else
		var newAccount = acc.new();
		$('#bulkgentable tr:last').after('<tr class="privaddkey"><td><textarea class="form-control" rows="4" type="text" disabled>' + newAccount.address + '</textarea></td><td><textarea class="form-control" rows="4" type="text" disabled>' + newAccount.private + '</textarea></td></tr>');
		csv += newAccount.address + ',' + newAccount.private + '\n';
		txt += newAccount.address + '\t' + newAccount.private + '\n';
		jsonarr.push({
			address: newAccount.address,
			private: newAccount.private
		});
	}
	var csvblob = new Blob([csv], {
		type: "text/csv;charset=UTF-8"
	});
	var txtblob = new Blob([txt], {
		type: "text/plain;charset=UTF-8"
	});
	var jsonblob = new Blob([JSON.stringify(jsonarr)], {
		type: "text/json;charset=UTF-8"
	});
	var fname = "bulk_ether_accounts";
	$("#bulkexportjson").attr('href', window.URL.createObjectURL(jsonblob));
	$("#bulkexportjson").attr('download', fname + '.json');
	$("#bulkexportcsv").attr('href', window.URL.createObjectURL(csvblob));
	$("#bulkexportcsv").attr('download', fname + '.csv');
	$("#bulkexporttxt").attr('href', window.URL.createObjectURL(txtblob));
	$("#bulkexporttxt").attr('download', fname + '.txt');
	acc.clear();
}

function printQRcode() {
	var address = $("#address").val();
	var qrsourceprivkey = $("#qrcode").html();
	var qrsourceadd = $("#qrcodeAdd").html();
    $("#paperwalletprivqr").html(qrsourceprivkey);
    $("#paperwalletpriv").html($("#privkey").val());
    $("#paperwalletaddqr").html(qrsourceadd);
    $("#paperwalletadd").html(address);
	var html = $("#panePrint").html()+"<script>setTimeout(function(){window.print();},2000);</script>";// "<h4>Address (" + address + ")</h4><br/>" + qrsourceadd + "<h4>Private Key</h4></br>" + qrsourceprivkey;
	var win = window.open("about:blank", "_blank");
	win.document.write(html);
   // window.popup.onload=function(){win.focus();	win.print();};
	//win.focus();
	//win.print();
}
HTMLElement.prototype.click = function() {
	var evt = this.ownerDocument.createEvent('MouseEvents');
	evt.initMouseEvent('click', true, true, this.ownerDocument.defaultView, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
	this.dispatchEvent(evt);
}