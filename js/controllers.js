angular.module("ContactsService", []).service("contactsService", ['$http', function($http) {
    var baseUrl = "http://fast-gorge.herokuapp.com";

    this.getContacts = function() {
        return $http.get(baseUrl + "/contacts").then(function(response) {
            return response.data;
        });
    };

    this.addContact = function(contact) {
        return $http.post(baseUrl + "/contacts", contact).then(function(response) {
            return response.data;
        });
    }

    this.updateContact = function(contact) {
        return $http.put(baseUrl + "/contacts/" + contact.id, contact).then(function(response) {
            return response.data;
        })
    }

    this.deleteContact = function(contact) {
        return $http.delete(baseUrl + "/contacts/" + contact.id);
    }

}]);

angular.module("AddressBook", ["ContactsService", "ui.bootstrap", "angular-growl"])
    .config(['growlProvider', function(growlProvider) {
        growlProvider.globalTimeToLive(3000);
    }])
    .controller("AddressBookController", function(contactsService, $uibModal, growl) {
        var vm = this;

        function loadContacts() {
            return contactsService
                .getContacts()
                .then(function(contacts) {
                    vm.contacts = contacts;
                }).catch(function(err) {
                    console.error(err);
                    growl.error("Error loading contacts");
                });
        }

        loadContacts();

        vm.openAddContactModal = function() {
            $uibModal.open({
                templateUrl: "contactModal",
                controller: "ContactModalCtrl",
                resolve: {
                    context: function() {
                        return {
                            title: "Add a Contact",
                            contact: {}
                        };
                    }
                }
            }).result.then(function(newContact) {
                contactsService
                    .addContact(newContact)
                    .then(function() {
                        growl.info(newContact.first_name + " " + newContact.surname + " added");
                    }).catch(function(err) {
                        console.error(err);
                        growl.error("Error adding contact");
                    }).then(loadContacts);
            });
        };

        vm.openUpdateContactModal = function(contact) {
            $uibModal.open({
                templateUrl: "contactModal",
                controller: "ContactModalCtrl",
                resolve: {
                    context: function() {
                        return {
                            title: "Update " + contact.first_name + " " + contact.surname,
                            contact: contact
                        }
                    }
                }
            }).result.then(function(contact) {
                contactsService
                    .updateContact(contact)
                    .then(function() {
                        growl.info(contact.first_name + " " + contact.surname + " updated");
                    }).catch(function(err) {
                        console.error(err);
                        growl.error("Error updating contact");
                    }).then(loadContacts);
            });
        };

        vm.openDeleteContactModal = function(contact) {
            $uibModal.open({
                templateUrl: "deleteContactModal",
                controller: "DeleteContactModalCtrl",
                resolve: {
                    contact: contact
                }
            }).result.then(function() {
                contactsService
                .deleteContact(contact)
                .then(function() {
                    growl.info(contact.first_name + " " + contact.surname + " deleted");
                }).catch(function(err){
                    console.error(err);
                    growl.error("Error deleting contact");
                }).then(loadContacts);
            });
        };
    }).controller('ContactModalCtrl', function($scope, $uibModalInstance, context) {

        $scope.title = context.title;
        $scope.contact = context.contact;

        $scope.ok = function() {
            $uibModalInstance.close($scope.contact);
        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };
    }).controller('DeleteContactModalCtrl', function($scope, $uibModalInstance, contact) {

        $scope.contact = contact;

        $scope.yes = function() {
            $uibModalInstance.close();
        };

        $scope.no = function() {
            $uibModalInstance.dismiss('cancel');
        };
    });