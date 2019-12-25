* Create Party
    * Check the connection whether he is already in a party,
        * If not , create a new party and add him in party member list, make him admin
        * If so , throw error - "Only one party allowed"

* Join Party
    * Check the connection  whether he is already in a party
        * If not , add him in party member
        * If so, throw error

* End Party
    * Notify all the party members , end the party and reset the connection state

------------------------------------------------------------------------------------------------------

* Connection Close
    * trigger `close` event for that connection
        * if he is an admin , make next member in the list to be admin , notify others
            * if party member list is empty, end the party
        * if he is a DJ , then notify others , now anyone can become a DJ after admin's approval
        * if a normal member, just notify others

------------------------------------------------------------------------------------------------------

* Become DJ
    * if he is an admin, approve the request immediately
    * if not an admin, forward the request to admin
        * if admin approves , forward the response to respective member who requested to become DJ and send the partyMemberIds to DJ to establish peer connection
        * if admin rejects , forward the response to requester

------------------------------------------------------------------------------------------------------

