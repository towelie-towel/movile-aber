const reverse_geolocalization_url = "https://revgeocode.search.hereapi.com/v1/revgeocode?apiKey=mRASkFtnRqYimoHBzud5-kSsj0y_FvqR-1jwJHrfUvQ&at=23.134868793665653,-82.37683734202062"
const routing_url = "https://router.hereapi.com/v8/routes?apiKey=mRASkFtnRqYimoHBzud5-kSsj0y_FvqR-1jwJHrfUvQ&transportMode=car&origin=23.133293381495083,-82.39382428666123&destination=23.134868793665653,-82.37683734202062&return=polyline"
const route_matching_url = "https://routematching.hereapi.com/v8/match/routelinks?apiKey=mRASkFtnRqYimoHBzud5-kSsj0y_FvqR-1jwJHrfUvQ&waypoint0=23.133293381495083,-82.39382428666123&waypoint1=23.134868793665653,-82.37683734202062&mode=shortest;car;traffic:default&language=es-es"
const waypoints_format = `Comma separated waypoint latitude, longitude in WGS-84 degree. The coordinates may be directly followed by ;transitRadius;label;heading[;optional specifications]. A route must consist of at least 2 waypoints (start and destination). The coordinates may be directly followed by ;transitRadius;label;heading. The maximum number of waypoints is limited. However, this limit is not a fixed number but is a result of the limit for the overall processing time. Set a transit radius to only influence the route to go via a certain city (Example: &waypoint1=50.12,8.65;10000). Set a heading (degree clockwise from North) to improve map matching (Example: &waypoint0=latitude,longitude;;;140). To define a loading time or delay time at a waypoint, use stopOver[,timeInSeconds]! (Example: &waypoint1=stopOver,300!50.12,8.65). The optional specifications altitude, custom label, !StreetPosition and !LinkPosition, ignoreRestriction are currently supported. To define a radius around the waypoint where vehicle restrictions should be ignored use optional specification ';ignoreRestriction:radius[,drivePenalty[,type[,entryPenalty]]]. Example: &waypoint1=50.12,8.65;ignoreRestriction:8000,0.9,all,1800 . This is similar to the global parameter 'ignoreWaypointVehicleRestriction' which applies to all waypoint. But when specified explicitly for a waypoint, the 'ignoreRestriction' specification of waypoint is applied. Waypoints can have opening and closing times, can be unsorted or optional. Details are in Key Concepts / Waypoint sorting, optional Pickup and Opening Times`
const waypoints_sequence_url = "https://wps.hereapi.com/v8/findsequence2?apiKey=mRASkFtnRqYimoHBzud5-kSsj0y_FvqR-1jwJHrfUvQ&start=23.133293381495083,-82.39382428666123&end=23.134868793665653,-82.37683734202062&mode=shortest;car;traffic:default&language=es-es"

