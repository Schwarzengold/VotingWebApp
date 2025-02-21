// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting 
{

    address private owner;
    uint private candidateFee = 0.01 ether;

    struct Candidate 
    {
        string name;
        uint votes;
        bool exists;
    }

    mapping(string => Candidate) private candidates;
    string[] private candidateList;
    mapping(address => bool) private voters;

    constructor() 
    {
        owner = msg.sender;
    }

    function addCandidate(string memory _name) public payable 
    {
        require(msg.value >= candidateFee, "Insufficient fee to add candidate");
        require(!candidates[_name].exists, "Candidate already exists");

        candidates[_name] = Candidate({
            name: _name,
            votes: 0,
            exists: true
        });
        candidateList.push(_name);
    }

    function vote(string memory _name) public 
    {
        require(!voters[msg.sender], "You have already voted");
        require(candidates[_name].exists, "Candidate does not exist");

        candidates[_name].votes++;
        voters[msg.sender] = true;
    }

    function getWinner() public view returns (string memory winnerName) 
    {
        require(msg.sender == owner, "Only owner can determine the winner");

        uint highestVotes = 0;
        for (uint i = 0; i < candidateList.length; i++) {
            string memory currentCandidate = candidateList[i];
            if (candidates[currentCandidate].votes > highestVotes) {
                highestVotes = candidates[currentCandidate].votes;
                winnerName = currentCandidate;
            }
        }
    }

    function getCandidateList() public view returns (string[] memory) 
    {
        return candidateList;
    }

    function getCandidateDetails(string memory _name) public view returns (string memory name, uint votes, bool exists) 
    {
        Candidate memory cand = candidates[_name];
        return (cand.name, cand.votes, cand.exists);
    }

    function getCandidateFee() public view returns (uint) {
        return candidateFee;
    }

    function checkMyVoteStatus() public view returns (string memory) 
    {
        if (voters[msg.sender]) {
            return "This adress already voted!";
        } else {
            return "This adress didn't vote yet";
        }
    }

    function getOwner() public view returns (address) {
        return owner;
    }
}