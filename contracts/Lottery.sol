pragma solidity ^0.4.17;

contract Lottery{
    address public manager;
    address[] public players;

    function Lottery( ) public {
      // manager is intialized with address of person who has created contract
        manager=msg.sender;
    }
    // payable is a kayword that represents that a transaction will take place and so some ether will be spent.
    function enter() public payable{
        require(msg.value>.01 ether);
        players.push(msg.sender);
    }
    // view is a keyword that tells that functions will not make any modification
    function random() private view returns(uint){
      //keccak256 is alias for sha3
        return uint(keccak256(block.difficulty,now,players));
   }
 function pickWinner() public restricted{
   //Picking a winner by calling the random generator function and taking module of it with total players.
     uint winner=random()% players.length;
     players[winner].transfer(address(this).balance);
     // resetting the players array. new address[](0) represents that array is a dynamic array of type address
     // with total values 0.
     players=new address[](0);
 }
 // Modifier is used to allow us to remove code duplicacy of code. So if many functions are calling
 // a functionality we can create a modifier for it and call that modifier during function definition
 //function pickWinner() public restricted . The restricted here is the modifier
 modifier restricted(){
   // msg.sender is used to fetch address of person who is calling function
     require(msg.sender==manager);

     _;
 }
// This function return array of players.
 function getPlayers( ) public view returns(address[]){
     return players;
 }
}
