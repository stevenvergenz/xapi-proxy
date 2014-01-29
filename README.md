#xapi-proxy

ADL's [Experience API](https://github.com/adlnet/xAPI-Spec) defines a language for learning content to communicate
training data about a learner to an external Learning Record Store (LRS). As a protocol it is perfectly adequate to get
data out of a piece of learning content. Logistically though, the learner has no way of knowing to what LRS the content
decided to publish his/her data to, without the learner explicitly providing the content with an LRS endpoint and
publishing credentials.

The Experience API Proxy project seeks a solution to this problem. It allows the learner (or the learning management
system) to register the LRS information with the proxy. The content can then make its xAPI requests to the proxy, and
the proxy will route the statements to the specified LRS. This amounts to live configuration of the content by external
systems or users without having to significantly change the content.

The proxy also stores learner information (specifically the "actor" envelope of the xAPI statement), so a learning
management system can provide that information to the content as well, without requiring the learner to re-submit it.

The basic data flow can be seen in the below graphic:
  
![](https://dl.dropboxusercontent.com/u/31705663/xapi_sequence.png)
