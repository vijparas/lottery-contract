
const assert=require('assert');
// ganache is the local test network
const ganache=require('ganache-cli');

const Web3=require('web3');
const provider = ganache.provider();
const web3 = new Web3(provider);
//bytecode is the code that will be deployed on the network
const {interface,bytecode}=require('../compile.js');
let lottery;
let accounts;
/*
beforeEach is executed before each test. This is generally used to set common properties accessible
across tests
*/
beforeEach(async ()=>{
  accounts=await web3.eth.getAccounts();
  lottery=await new web3.eth.Contract(JSON.parse(interface))
          .deploy({data:bytecode})
          .send({from:accounts[0],gas:'1000000'})
});
// describe is used to group tests

describe('Lottery Contract',()=>{
// it is the the test that will be executed
  it('deploys a contract',()=>{
    //checks if contract deployes has an address attached to it
    assert.ok(lottery.options.address);
  });
  it('account enters into lottery', async ()=>{
    await lottery.methods.enter().send({
      from:accounts[0],
      value:web3.utils.toWei('0.02', 'ether')
    });
    const players=await lottery.methods.getPlayers().call({
      from:accounts[0]
    })
    assert.equal(accounts[0],players[0]);
    assert.equal(1,players.length);
  });

  it('allows multiple accounts to enters into lottery', async ()=>{
    await lottery.methods.enter().send({
      from:accounts[0],
      value:web3.utils.toWei('0.02', 'ether')
    });
    await lottery.methods.enter().send({
      from:accounts[1],
      value:web3.utils.toWei('0.02', 'ether')
    });
    await lottery.methods.enter().send({
      from:accounts[2],
      value:web3.utils.toWei('0.02', 'ether')
    });
    const players=await lottery.methods.getPlayers().call({
      from:accounts[0]
    });

    assert.equal(accounts[0],players[0]);
    assert.equal(accounts[1],players[1]);
    assert.equal(accounts[2],players[2]);
    assert.equal(3,players.length);
  });
  it('should send minimum ether to enter',async()=>{
    try{
      await lottery.methods.enter().send({
        from:accounts[1],
        value:0
      });
      // will always make test as a failure so if exception is not thrown our test has failed
      assert(false);
    }
    catch(err){
      // if we reach catch block this means our test is succesfull
      assert(err);
    }

  });
  it('only manager should call pickWinner function',async()=>{
    // it should go into catch block as contract is being created by account[0] and pickWinner
    //is being called by account[1] which is not manager. so the function modifier restricted should throw an
    //error which should bring us into catch block.
    try{
      await lottery.methods.pickWinner().send({
        from:accounts[1]

      });
      // will always make test as a failure so if exception is not thrown our test has failed
      assert(false);
    }
    catch(err){
      // if we reach catch block this means our test is succesfull
      assert(err);
    }

  });
  it('send money to winnder and resets the players array',async()=>{
        await lottery.methods.enter().send({
        from:accounts[0],
        value:web3.utils.toWei('2','ether')
      });
        const intialBalance=await web3.eth.getBalance(accounts[0]);
        await lottery.methods.pickWinner().send({from:accounts[0]});
        const finalBalance=await web3.eth.getBalance(accounts[0]);
        const difference=finalBalance-intialBalance;
        assert(difference>web3.utils.toWei('1.8','ether'));
  });
})
