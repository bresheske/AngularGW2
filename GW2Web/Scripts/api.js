var gw2app = angular.module('gw2api', ['ngAnimate']);

// Controller for our worlds object.
gw2app.controller('gw2api', function ($scope, $http) {

    // Selected World & Map vars.
    $scope.selectedWorld = 0;
    $scope.selectedMap = 0;

    // Worlds!
    $http({ method: 'GET', url: 'https://api.guildwars2.com/v1/world_names.json' }).
        success(function (data) {
            $scope.worlds = data;
        });

    // Maps!
    $http({ method: 'GET', url: 'https://api.guildwars2.com/v1/map_names.json' }).
        success(function (data) {
            $scope.maps = data;
        });

    // Event Names!
    $http({ method: 'GET', url: 'https://api.guildwars2.com/v1/event_names.json' }).
        success(function (data) {
            $scope.eventnames = data;
        });

    // Handlers for "binding"
    $scope.setWorld = function (wid) {
        $scope.selectedWorld = wid;
        $scope.loadEvents();

        // Set active status.
        $scope.worlds.forEach(function (w) {
            if (w.id == wid)
                w.active = "active";
            else
                w.active = null;
        });
    }

    $scope.setMap = function (mid) {
        $scope.selectedMap = mid;
        $scope.loadEvents();

        // Set active status.
        $scope.maps.forEach(function (m) {
            if (m.id == mid)
                m.active = "active";
            else
                m.active = null;
        });
    }

    // Event handler for loading in events for a world/map pair.
    $scope.loadEvents = function () {

        // Have to had previously selected a map and world.
        if ($scope.selectedWorld == 0 || $scope.selectedMap == 0)
            return;

        // Call out to the guildwars2 API and grab the actual events.
        $http({ method: 'GET', url: 'https://api.guildwars2.com/v1/events.json?world_id=' + $scope.selectedWorld + "&map_id=" + $scope.selectedMap }).
            success(function (data, status, headers, config) {

                // First filter out the inactive.
                $scope.events = data.events.filter(function (element, index, array) {
                    return element.state == "Active"
                        || element.state == "Warmup"
                        || element.state == "Preparation";
                });

                // Now sort them.
                $scope.events.sort(function (a, b) {
                    if (a.state == b.state)
                        return 0;
                    else if (a.state == "Active")
                        return -1;
                    else if (a.state == "Preparation" && b.state != "Active")
                        return -1;
                    else
                        return 1;
                });
                
                $scope.events.forEach(function (e) {
                    // Attach the name to each event.
                    var evtname = $.grep($scope.eventnames, function (evtn) {
                        if (evtn.id == e.event_id)
                            return evtn;
                    });
                    e.name = evtname[0].name;

                    // Attach the status to each event.
                    if (e.state == "Active")
                        e.status = "success";
                    else if (e.state == "Preparation")
                        e.status = "info";
                    else
                        e.status = "warning";
                });

            });
    };

});
